package server

import (
	"encoding/json"
	"errors"
	"net/http"
	"sort"
	"strings"
	"time"

	"magnavia/backend/internal/domain"
	"magnavia/backend/internal/store"
)

type Server struct {
	store      *store.Memory
	adminToken string
}

type Option func(*Server)

func WithAdminToken(token string) Option {
	return func(s *Server) {
		s.adminToken = token
	}
}

type healthResponse struct {
	OK      bool   `json:"ok"`
	Service string `json:"service"`
}

type errorResponse struct {
	Error string `json:"error"`
}

func New(options ...Option) http.Handler {
	s := &Server{
		store: store.NewMemory(),
	}
	for _, option := range options {
		option(s)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.healthz)
	mux.HandleFunc("/api/v1/catalog/classes", s.classes)
	mux.HandleFunc("/api/v1/assessments", s.assessments)
	mux.HandleFunc("/api/v1/assessments/", s.assessmentByID)
	mux.HandleFunc("/api/v1/chat/messages", s.chatMessage)
	mux.HandleFunc("/api/v1/admin/summary", s.adminSummary)

	return s.withCORS(mux)
}

func (s *Server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) healthz(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	writeJSON(w, http.StatusOK, healthResponse{
		OK:      true,
		Service: "magna-via-api",
	})
}

func (s *Server) classes(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"classes": domain.ClassCatalog(),
	})
}

func (s *Server) assessments(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}

	var req domain.AssessmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	if err := validateAssessmentRequest(req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	scores, invalid := domain.ScoreAnswers(req.QuizAnswers)
	if len(invalid) > 0 {
		writeError(w, http.StatusBadRequest, "invalid quiz answers for questions: "+strings.Join(invalid, ", "))
		return
	}

	top := domain.TopDimensions(scores)
	result := domain.PickClass(scores)
	assessment := domain.Assessment{
		CreatedAt:     time.Now().UTC(),
		Biodata:       req.Biodata,
		HobbyCards:    append([]string(nil), req.HobbyCards...),
		BirthStar:     req.BirthStar,
		QuizAnswers:   req.QuizAnswers,
		Scores:        scores,
		TopDimensions: top,
		Result:        result,
	}

	writeJSON(w, http.StatusCreated, s.store.SaveAssessment(assessment))
}

func (s *Server) assessmentByID(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/v1/assessments/")
	if id == "" || strings.Contains(id, "/") {
		writeError(w, http.StatusNotFound, "assessment not found")
		return
	}

	assessment, err := s.store.GetAssessment(id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "assessment not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load assessment")
		return
	}
	writeJSON(w, http.StatusOK, assessment)
}

func (s *Server) chatMessage(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}

	var req domain.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if strings.TrimSpace(req.Message) == "" {
		writeError(w, http.StatusBadRequest, "message is required")
		return
	}

	var result domain.ClassResult
	if req.AssessmentID != "" {
		assessment, err := s.store.GetAssessment(req.AssessmentID)
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "assessment not found")
			return
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to load assessment")
			return
		}
		result = assessment.Result
	}
	if result.ID == "" {
		result = domain.ClassCatalog()[0]
	}

	writeJSON(w, http.StatusOK, domain.ChatResponse{
		Reply: "Cenayang melihat resonansi " + result.Name + ". Untuk saat ini ini masih jawaban dummy, tapi konteks hasilmu sudah dikirim ke backend.",
	})
}

func (s *Server) adminSummary(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	if !s.authorizedAdmin(r) {
		writeError(w, http.StatusUnauthorized, "admin token required")
		return
	}

	assessments := s.store.ListAssessments()
	classCounts := map[string]int{}
	dimensionTotals := domain.BlankScores()
	for _, assessment := range assessments {
		classCounts[assessment.Result.ID]++
		for _, dim := range domain.Dimensions {
			dimensionTotals[dim] += assessment.Scores[dim]
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"totalAssessments": len(assessments),
		"classCounts":      classCounts,
		"dimensionTotals":  dimensionTotals,
	})
}

func (s *Server) authorizedAdmin(r *http.Request) bool {
	if s.adminToken == "" {
		return true
	}
	return r.Header.Get("X-Admin-Token") == s.adminToken
}

func validateAssessmentRequest(req domain.AssessmentRequest) error {
	if strings.TrimSpace(req.Biodata.FullName) == "" {
		return errors.New("biodata.fullName is required")
	}
	if strings.TrimSpace(req.Biodata.Email) == "" {
		return errors.New("biodata.email is required")
	}
	if strings.TrimSpace(req.BirthStar) == "" {
		return errors.New("birthStar is required")
	}
	if len(req.HobbyCards) == 0 || len(req.HobbyCards) > 3 {
		return errors.New("hobbyCards must contain 1 to 3 items")
	}
	if len(req.QuizAnswers) != len(domain.AnswerKey) {
		return errors.New("quizAnswers must contain all 15 answers")
	}

	keys := make([]string, 0, len(req.QuizAnswers))
	for key := range req.QuizAnswers {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return nil
}

func requireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method == method {
		return true
	}
	w.Header().Set("Allow", method)
	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	return false
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorResponse{Error: message})
}
