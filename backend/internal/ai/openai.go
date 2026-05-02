package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"magnavia/backend/internal/domain"
)

type ChatGenerator interface {
	GenerateChatReply(ctx context.Context, assessment domain.Assessment, message string) (string, error)
}

type OpenAIClient struct {
	apiKey     string
	model      string
	baseURL    string
	httpClient *http.Client
}

func NewOpenAIClient(apiKey, model, baseURL string) *OpenAIClient {
	return &OpenAIClient{
		apiKey:  strings.TrimSpace(apiKey),
		model:   strings.TrimSpace(model),
		baseURL: strings.TrimRight(strings.TrimSpace(baseURL), "/"),
		httpClient: &http.Client{
			Timeout: 18 * time.Second,
		},
	}
}

func (c *OpenAIClient) GenerateChatReply(ctx context.Context, assessment domain.Assessment, message string) (string, error) {
	if c.apiKey == "" {
		return "", errors.New("openai api key is not configured")
	}
	model := c.model
	if model == "" {
		model = "gpt-5-nano"
	}
	baseURL := c.baseURL
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}

	body := openAIResponseRequest{
		Model:           model,
		Instructions:    cenayangInstructions(),
		Input:           buildChatContext(assessment, message),
		MaxOutputTokens: 180,
	}
	payload, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/responses", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	res, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	var response openAIResponse
	if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
		return "", err
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		if response.Error.Message != "" {
			return "", errors.New(response.Error.Message)
		}
		return "", fmt.Errorf("openai request failed with status %d", res.StatusCode)
	}

	text := strings.TrimSpace(response.OutputText)
	if text == "" {
		text = strings.TrimSpace(response.firstText())
	}
	if text == "" {
		return "", errors.New("openai returned an empty reply")
	}
	return text, nil
}

type openAIResponseRequest struct {
	Model           string `json:"model"`
	Instructions    string `json:"instructions"`
	Input           string `json:"input"`
	MaxOutputTokens int    `json:"max_output_tokens"`
}

type openAIResponse struct {
	OutputText string `json:"output_text"`
	Output     []struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	} `json:"output"`
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (r openAIResponse) firstText() string {
	for _, output := range r.Output {
		for _, content := range output.Content {
			if content.Text != "" {
				return content.Text
			}
		}
	}
	return ""
}

func cenayangInstructions() string {
	return `Kamu adalah Cenayang Magna Via, oracle karier untuk siswa Indonesia.
Jawab dalam Bahasa Indonesia yang hangat, jelas, dan sedikit bernuansa fantasi Arcadia.
Berikan arahan karier berdasarkan RIASEC, hasil class, jurusan, birth star, dan hobby cards.
Jangan terdengar seperti ramalan mutlak. Tekankan bahwa hasil adalah kompas eksplorasi, bukan batasan.
Jangan memberi nasihat medis, hukum, atau keputusan hidup absolut.
Jika user bingung, beri 2-3 langkah kecil yang bisa dicoba.
Target panjang jawaban 60-100 kata, maksimal 3 paragraf pendek.`
}

func buildChatContext(assessment domain.Assessment, message string) string {
	return fmt.Sprintf(`Data hasil pengguna:
- Class: %s (%s)
- Ringkasan: %s
- RIASEC scores: R=%d, I=%d, A=%d, S=%d, E=%d, C=%d
- Top dimensions: %s
- Birth star: %s
- Hobby cards: %s
- Rekomendasi jurusan: %s

Pertanyaan pengguna:
%s`,
		assessment.Result.Name,
		assessment.Result.DominantLabel,
		assessment.Result.Summary,
		assessment.Scores["R"],
		assessment.Scores["I"],
		assessment.Scores["A"],
		assessment.Scores["S"],
		assessment.Scores["E"],
		assessment.Scores["C"],
		strings.Join(assessment.TopDimensions, ", "),
		assessment.BirthStar,
		strings.Join(assessment.HobbyCards, ", "),
		strings.Join(assessment.Result.Majors, ", "),
		strings.TrimSpace(message),
	)
}
