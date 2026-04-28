package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"magnavia/backend/internal/store"
)

func TestCreateAndReadAssessment(t *testing.T) {
	app := testApp(t)
	body := validAssessmentBody()

	createReq, err := http.NewRequest(http.MethodPost, "/api/v1/assessments", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	createReq.Header.Set("Content-Type", "application/json")
	createRes, err := app.Test(createReq)
	if err != nil {
		t.Fatal(err)
	}
	defer createRes.Body.Close()

	if createRes.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201, got %d", createRes.StatusCode)
	}

	var created struct {
		ID     string         `json:"id"`
		Scores map[string]int `json:"scores"`
		Result struct {
			ID string `json:"id"`
		} `json:"result"`
	}
	if err := json.NewDecoder(createRes.Body).Decode(&created); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if created.ID == "" {
		t.Fatal("expected generated id")
	}
	if created.Scores["R"] != 23 {
		t.Fatalf("expected all-A fixture with personalization to score R=23, got %d", created.Scores["R"])
	}
	if created.Result.ID == "" {
		t.Fatal("expected result id")
	}

	getReq, err := http.NewRequest(http.MethodGet, "/api/v1/assessments/"+created.ID, nil)
	if err != nil {
		t.Fatal(err)
	}
	getRes, err := app.Test(getReq)
	if err != nil {
		t.Fatal(err)
	}
	defer getRes.Body.Close()

	if getRes.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", getRes.StatusCode)
	}
}

func TestCreateAssessmentValidatesAnswerCount(t *testing.T) {
	app := testApp(t)
	body := []byte(`{
		"biodata": {"fullName":"A","email":"a@example.com"},
		"hobbyCards": ["fighter"],
		"birthStar": "ignis",
		"quizAnswers": {"1": {"letter":"A"}}
	}`)
	req, err := http.NewRequest(http.MethodPost, "/api/v1/assessments", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	res, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", res.StatusCode)
	}
}

func TestAdminSummaryRequiresTokenWhenConfigured(t *testing.T) {
	app := testApp(t, WithAdminToken("secret"))
	req, err := http.NewRequest(http.MethodGet, "/api/v1/admin/summary", nil)
	if err != nil {
		t.Fatal(err)
	}
	res, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", res.StatusCode)
	}

	req, err = http.NewRequest(http.MethodGet, "/api/v1/admin/summary", nil)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("X-Admin-Token", "secret")
	res, err = app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}
}

func TestAdminLoginReturnsBearerSession(t *testing.T) {
	app := testApp(t, WithAdminAuth("oracle", "safe-password", "session-secret"))

	loginReq, err := http.NewRequest(
		http.MethodPost,
		"/api/v1/admin/login",
		strings.NewReader(`{"username":"oracle","password":"safe-password"}`),
	)
	if err != nil {
		t.Fatal(err)
	}
	loginReq.Header.Set("Content-Type", "application/json")

	loginRes, err := app.Test(loginReq)
	if err != nil {
		t.Fatal(err)
	}
	defer loginRes.Body.Close()
	if loginRes.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", loginRes.StatusCode)
	}

	var body struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(loginRes.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body.Token == "" {
		t.Fatal("expected login token")
	}

	summaryReq, err := http.NewRequest(http.MethodGet, "/api/v1/admin/summary", nil)
	if err != nil {
		t.Fatal(err)
	}
	summaryReq.Header.Set("Authorization", "Bearer "+body.Token)
	summaryRes, err := app.Test(summaryReq)
	if err != nil {
		t.Fatal(err)
	}
	defer summaryRes.Body.Close()
	if summaryRes.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", summaryRes.StatusCode)
	}
}

func TestAdminLoginRejectsInvalidCredentials(t *testing.T) {
	app := testApp(t, WithAdminAuth("oracle", "safe-password", "session-secret"))

	req, err := http.NewRequest(
		http.MethodPost,
		"/api/v1/admin/login",
		strings.NewReader(`{"username":"oracle","password":"wrong"}`),
	)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", res.StatusCode)
	}
}

func TestAdminAssessmentsReturnsSubmittedRows(t *testing.T) {
	app := testApp(t)
	createReq, err := http.NewRequest(http.MethodPost, "/api/v1/assessments", bytes.NewReader(validAssessmentBody()))
	if err != nil {
		t.Fatal(err)
	}
	createReq.Header.Set("Content-Type", "application/json")
	createRes, err := app.Test(createReq)
	if err != nil {
		t.Fatal(err)
	}
	defer createRes.Body.Close()
	if createRes.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201, got %d", createRes.StatusCode)
	}

	req, err := http.NewRequest(http.MethodGet, "/api/v1/admin/assessments", nil)
	if err != nil {
		t.Fatal(err)
	}
	res, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}

	var body struct {
		Assessments []struct {
			FullName string `json:"fullName"`
			Result   struct {
				ID string `json:"id"`
			} `json:"result"`
		} `json:"assessments"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if len(body.Assessments) != 1 {
		t.Fatalf("expected 1 assessment, got %d", len(body.Assessments))
	}
	if body.Assessments[0].FullName != "Arcadia Tester" {
		t.Fatalf("unexpected full name %q", body.Assessments[0].FullName)
	}
}

func TestAllowOriginHandlesCommaSeparatedValuesAndTrailingSlash(t *testing.T) {
	allow := allowOrigin("https://magna-via-admin.vercel.app/, http://localhost:8090")

	if !allow("https://magna-via-admin.vercel.app") {
		t.Fatal("expected admin origin to be allowed")
	}
	if !allow("http://localhost:8090/") {
		t.Fatal("expected localhost origin with trailing slash to be allowed")
	}
	if allow("https://example.com") {
		t.Fatal("expected unknown origin to be blocked")
	}
}

func testApp(t *testing.T, options ...Option) *fiber.App {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file:"+uuid.NewString()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := store.AutoMigrate(db); err != nil {
		t.Fatal(err)
	}
	return New(store.NewGorm(db), "*", options...)
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
