package domain

import "time"

type Biodata struct {
	FullName string `json:"fullName"`
	Age      string `json:"age"`
	Grade    string `json:"grade"`
	School   string `json:"school"`
	Email    string `json:"email"`
	Gender   string `json:"gender"`
}

type QuizAnswer struct {
	Letter string `json:"letter"`
	Text   string `json:"text,omitempty"`
}

type AssessmentRequest struct {
	Biodata     Biodata               `json:"biodata"`
	HobbyCards  []string              `json:"hobbyCards"`
	BirthStar   string                `json:"birthStar"`
	QuizAnswers map[string]QuizAnswer `json:"quizAnswers"`
}

type Scores map[string]int

type ClassResult struct {
	ID                 string   `json:"id"`
	Name               string   `json:"name"`
	Title              string   `json:"title"`
	Color              string   `json:"color"`
	DominantDimensions []string `json:"dominantDimensions"`
	DominantLabel      string   `json:"dominantLabel"`
	Summary            string   `json:"summary"`
	Strengths          []string `json:"strengths"`
	Majors             []string `json:"majors"`
}

type Assessment struct {
	ID            string                `json:"id"`
	CreatedAt     time.Time             `json:"createdAt"`
	Biodata       Biodata               `json:"biodata"`
	HobbyCards    []string              `json:"hobbyCards"`
	BirthStar     string                `json:"birthStar"`
	QuizAnswers   map[string]QuizAnswer `json:"quizAnswers"`
	Scores        Scores                `json:"scores"`
	TopDimensions []string              `json:"topDimensions"`
	Result        ClassResult           `json:"result"`
}

type ChatRequest struct {
	AssessmentID string `json:"assessmentId"`
	Message      string `json:"message"`
}

type ChatResponse struct {
	Reply string `json:"reply"`
}
