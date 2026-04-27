package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCreateAndReadAssessment(t *testing.T) {
	handler := New()
	body := validAssessmentBody()

	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/assessments", bytes.NewReader(body))
	createReq.Header.Set("Content-Type", "application/json")
	createRes := httptest.NewRecorder()
	handler.ServeHTTP(createRes, createReq)

	if createRes.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", createRes.Code, createRes.Body.String())
	}

	var created struct {
		ID     string         `json:"id"`
		Scores map[string]int `json:"scores"`
		Result struct {
			ID string `json:"id"`
		} `json:"result"`
	}
	if err := json.Unmarshal(createRes.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if created.ID == "" {
		t.Fatal("expected generated id")
	}
	if created.Scores["R"] != 20 {
		t.Fatalf("expected all-A fixture to score R=20, got %d", created.Scores["R"])
	}
	if created.Result.ID == "" {
		t.Fatal("expected result id")
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/assessments/"+created.ID, nil)
	getRes := httptest.NewRecorder()
	handler.ServeHTTP(getRes, getReq)

	if getRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", getRes.Code, getRes.Body.String())
	}
}

func TestCreateAssessmentValidatesAnswerCount(t *testing.T) {
	body := []byte(`{
		"biodata": {"fullName":"A","email":"a@example.com"},
		"hobbyCards": ["fighter"],
		"birthStar": "ignis",
		"quizAnswers": {"1": {"letter":"A"}}
	}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/assessments", bytes.NewReader(body))
	res := httptest.NewRecorder()
	New().ServeHTTP(res, req)

	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", res.Code)
	}
}

func TestAdminSummaryRequiresTokenWhenConfigured(t *testing.T) {
	handler := New(WithAdminToken("secret"))
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/summary", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", res.Code)
	}

	req = httptest.NewRequest(http.MethodGet, "/api/v1/admin/summary", nil)
	req.Header.Set("X-Admin-Token", "secret")
	res = httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
}

func validAssessmentBody() []byte {
	return []byte(`{
		"biodata": {
			"fullName": "Arcadia Tester",
			"age": "17",
			"grade": "Kelas 12",
			"school": "SMA Arcadia",
			"email": "tester@example.com",
			"gender": "Pria"
		},
		"hobbyCards": ["fighter", "leader"],
		"birthStar": "ignis",
		"quizAnswers": {
			"1": {"letter":"A"},
			"2": {"letter":"A"},
			"3": {"letter":"A"},
			"4": {"letter":"A"},
			"5": {"letter":"A"},
			"6": {"letter":"A"},
			"7": {"letter":"A"},
			"8": {"letter":"A"},
			"9": {"letter":"A"},
			"10": {"letter":"A"},
			"11": {"letter":"A"},
			"12": {"letter":"A"},
			"13": {"letter":"A"},
			"14": {"letter":"A"},
			"15": {"letter":"A"}
		}
	}`)
}
