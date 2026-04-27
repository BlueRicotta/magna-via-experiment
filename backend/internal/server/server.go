package server

import (
	"errors"
	"sort"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"magnavia/backend/internal/domain"
	"magnavia/backend/internal/store"
)

type Server struct {
	store      store.AssessmentStore
	adminToken string
}

type Option func(*Server)

func WithAdminToken(token string) Option {
	return func(s *Server) {
		s.adminToken = token
	}
}

func New(dataStore store.AssessmentStore, corsOrigins string, options ...Option) *fiber.App {
	s := &Server{
		store: dataStore,
	}
	for _, option := range options {
		option(s)
	}

	app := fiber.New(fiber.Config{
		AppName:      "Magna Via API",
		ErrorHandler: errorHandler,
	})
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOriginsFunc: allowOrigin(corsOrigins),
		AllowHeaders:     "Origin, Content-Type, Accept, X-Admin-Token",
		AllowMethods:     "GET,POST,OPTIONS",
	}))

	app.Get("/healthz", s.healthz)

	api := app.Group("/api/v1")
	api.Get("/catalog/classes", s.classes)
	api.Post("/assessments", s.createAssessment)
	api.Get("/assessments/:id", s.getAssessment)
	api.Post("/chat/messages", s.chatMessage)
	api.Get("/admin/summary", s.adminSummary)
	api.Get("/admin/assessments", s.adminAssessments)

	return app
}

func (s *Server) healthz(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"ok":      true,
		"service": "magna-via-api",
	})
}

func (s *Server) classes(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"classes": domain.ClassCatalog(),
	})
}

func (s *Server) createAssessment(c *fiber.Ctx) error {
	var req domain.AssessmentRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if err := validateAssessmentRequest(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	scores, invalid := domain.ScoreAnswers(req.QuizAnswers)
	if len(invalid) > 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid quiz answers for questions: "+strings.Join(invalid, ", "))
	}

	assessment := domain.Assessment{
		CreatedAt:     time.Now().UTC(),
		Biodata:       req.Biodata,
		HobbyCards:    append([]string(nil), req.HobbyCards...),
		BirthStar:     req.BirthStar,
		QuizAnswers:   req.QuizAnswers,
		Scores:        scores,
		TopDimensions: domain.TopDimensions(scores),
		Result:        domain.PickClass(scores),
	}

	saved, err := s.store.SaveAssessment(c.Context(), assessment)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(saved)
}

func (s *Server) getAssessment(c *fiber.Ctx) error {
	assessment, err := s.store.GetAssessment(c.Context(), c.Params("id"))
	if errors.Is(err, store.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "assessment not found")
	}
	if err != nil {
		return err
	}
	return c.JSON(assessment)
}

func (s *Server) chatMessage(c *fiber.Ctx) error {
	var req domain.ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if strings.TrimSpace(req.Message) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "message is required")
	}

	result := domain.ClassCatalog()[0]
	if req.AssessmentID != "" {
		assessment, err := s.store.GetAssessment(c.Context(), req.AssessmentID)
		if errors.Is(err, store.ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "assessment not found")
		}
		if err != nil {
			return err
		}
		result = assessment.Result
	}

	_ = s.store.SaveChatMessage(c.Context(), store.ChatMessage{
		AssessmentID: req.AssessmentID,
		Sender:       "user",
		Message:      req.Message,
	})
	reply := "Cenayang melihat resonansi " + result.Name + ". Untuk saat ini ini masih jawaban dummy, tapi konteks hasilmu sudah dikirim ke backend."
	_ = s.store.SaveChatMessage(c.Context(), store.ChatMessage{
		AssessmentID: req.AssessmentID,
		Sender:       "oracle",
		Message:      reply,
	})

	return c.JSON(domain.ChatResponse{Reply: reply})
}

func (s *Server) adminSummary(c *fiber.Ctx) error {
	if !s.authorizedAdmin(c) {
		return fiber.NewError(fiber.StatusUnauthorized, "admin token required")
	}

	assessments, err := s.store.ListAssessments(c.Context())
	if err != nil {
		return err
	}

	classCounts := map[string]int{}
	dimensionTotals := domain.BlankScores()
	for _, assessment := range assessments {
		classCounts[assessment.Result.ID]++
		for _, dim := range domain.Dimensions {
			dimensionTotals[dim] += assessment.Scores[dim]
		}
	}

	return c.JSON(fiber.Map{
		"totalAssessments": len(assessments),
		"classCounts":      classCounts,
		"dimensionTotals":  dimensionTotals,
	})
}

func (s *Server) adminAssessments(c *fiber.Ctx) error {
	if !s.authorizedAdmin(c) {
		return fiber.NewError(fiber.StatusUnauthorized, "admin token required")
	}

	assessments, err := s.store.ListAssessments(c.Context())
	if err != nil {
		return err
	}

	type row struct {
		ID            string             `json:"id"`
		CreatedAt     time.Time          `json:"createdAt"`
		FullName      string             `json:"fullName"`
		Email         string             `json:"email"`
		Grade         string             `json:"grade"`
		School        string             `json:"school"`
		Gender        string             `json:"gender"`
		BirthStar     string             `json:"birthStar"`
		HobbyCards    []string           `json:"hobbyCards"`
		Scores        map[string]int     `json:"scores"`
		TopDimensions []string           `json:"topDimensions"`
		Result        domain.ClassResult `json:"result"`
	}

	rows := make([]row, 0, len(assessments))
	for _, assessment := range assessments {
		rows = append(rows, row{
			ID:            assessment.ID,
			CreatedAt:     assessment.CreatedAt,
			FullName:      assessment.Biodata.FullName,
			Email:         assessment.Biodata.Email,
			Grade:         assessment.Biodata.Grade,
			School:        assessment.Biodata.School,
			Gender:        assessment.Biodata.Gender,
			BirthStar:     assessment.BirthStar,
			HobbyCards:    assessment.HobbyCards,
			Scores:        map[string]int(assessment.Scores),
			TopDimensions: assessment.TopDimensions,
			Result:        assessment.Result,
		})
	}

	return c.JSON(fiber.Map{
		"assessments": rows,
	})
}

func (s *Server) authorizedAdmin(c *fiber.Ctx) bool {
	if s.adminToken == "" {
		return true
	}
	return c.Get("X-Admin-Token") == s.adminToken
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

func errorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "internal server error"

	var fiberErr *fiber.Error
	if errors.As(err, &fiberErr) {
		code = fiberErr.Code
		message = fiberErr.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"error": message,
	})
}

func allowOrigin(configured string) func(string) bool {
	allowed := map[string]bool{}
	for _, raw := range strings.Split(configured, ",") {
		origin := strings.TrimRight(strings.TrimSpace(raw), "/")
		if origin != "" {
			allowed[origin] = true
		}
	}

	return func(origin string) bool {
		origin = strings.TrimRight(strings.TrimSpace(origin), "/")
		if allowed["*"] || origin == "" {
			return true
		}
		return allowed[origin]
	}
}
