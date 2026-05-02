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
		MaxOutputTokens: 1000,
		Reasoning:       &openAIReasoning{Effort: "medium"},
	}

	response, err := c.createResponse(ctx, baseURL, body)
	if err != nil {
		return "", err
	}
	if text := response.replyText(); text != "" {
		return text, nil
	}

	retryBody := body
	retryBody.Reasoning = &openAIReasoning{Effort: "minimal"}
	retryResponse, retryErr := c.createResponse(ctx, baseURL, retryBody)
	if retryErr != nil {
		return "", fmt.Errorf("openai returned an empty reply (%s); retry failed: %w", response.debugSummary(), retryErr)
	}
	if text := retryResponse.replyText(); text != "" {
		return text, nil
	}
	return "", fmt.Errorf("openai returned an empty reply (%s; retry: %s)", response.debugSummary(), retryResponse.debugSummary())
}

func (c *OpenAIClient) createResponse(ctx context.Context, baseURL string, body openAIResponseRequest) (openAIResponse, error) {
	payload, err := json.Marshal(body)
	if err != nil {
		return openAIResponse{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/responses", bytes.NewReader(payload))
	if err != nil {
		return openAIResponse{}, err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	res, err := c.httpClient.Do(req)
	if err != nil {
		return openAIResponse{}, err
	}
	defer res.Body.Close()

	var response openAIResponse
	if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
		return openAIResponse{}, err
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		if response.Error.Message != "" {
			return openAIResponse{}, errors.New(response.Error.Message)
		}
		return openAIResponse{}, fmt.Errorf("openai request failed with status %d", res.StatusCode)
	}
	return response, nil
}

type openAIResponseRequest struct {
	Model           string           `json:"model"`
	Instructions    string           `json:"instructions"`
	Input           string           `json:"input"`
	MaxOutputTokens int              `json:"max_output_tokens"`
	Reasoning       *openAIReasoning `json:"reasoning,omitempty"`
}

type openAIReasoning struct {
	Effort string `json:"effort"`
}

type openAIResponse struct {
	ID         string `json:"id"`
	Status     string `json:"status"`
	OutputText string `json:"output_text"`
	Output     []struct {
		ID      string `json:"id"`
		Type    string `json:"type"`
		Text    string `json:"text"`
		Content []struct {
			Type        string `json:"type"`
			Text        string `json:"text"`
			Value       string `json:"value"`
			Annotations []any  `json:"annotations"`
		} `json:"content"`
	} `json:"output"`
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
	IncompleteDetails struct {
		Reason string `json:"reason"`
	} `json:"incomplete_details"`
	Usage struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
}

func (r openAIResponse) firstText() string {
	for _, output := range r.Output {
		if output.Text != "" {
			return output.Text
		}
		for _, content := range output.Content {
			if content.Text != "" {
				return content.Text
			}
			if content.Value != "" {
				return content.Value
			}
		}
	}
	return ""
}

func (r openAIResponse) replyText() string {
	text := strings.TrimSpace(r.OutputText)
	if text == "" {
		text = strings.TrimSpace(r.firstText())
	}
	return text
}

func (r openAIResponse) debugSummary() string {
	types := make([]string, 0, len(r.Output))
	for _, output := range r.Output {
		types = append(types, output.Type)
	}
	status := r.Status
	if status == "" {
		status = "unknown"
	}
	reason := r.IncompleteDetails.Reason
	if reason == "" {
		reason = "none"
	}
	return fmt.Sprintf(
		"status=%s incomplete_reason=%s output_types=%s output_tokens=%d",
		status,
		reason,
		strings.Join(types, ","),
		r.Usage.OutputTokens,
	)
}

func cenayangInstructions() string {
	return `Kamu adalah Cenayang Magna Via, oracle karier untuk siswa Indonesia.
Jawab dalam Bahasa Indonesia yang hangat, langsung, dan praktis, dengan sedikit nuansa Arcadia.
Gunakan hasil RIASEC, class, birth star, hobby cards, dan rekomendasi jurusan hanya sebagai konteks; jangan selalu menyebut semuanya.
Jawab pertanyaan utama di kalimat pertama. Untuk pertanyaan lanjutan, jangan menyapa, jangan memperkenalkan diri, dan jangan membuka dengan "Halo", "Selamat", "Salam", atau frasa serupa.
Jangan mengulang kalimat "kompas eksplorasi" kecuali user meminta kepastian mutlak, nasib, atau uang. Cukup sisipkan kehati-hatian secara natural bila perlu.
Jangan menyuruh user mengisi quiz/kartu/hobby lagi karena hasilnya sudah ada.
Jangan memberi nasihat medis, hukum, atau keputusan hidup absolut.
Berikan langkah kecil hanya jika user bertanya "bagaimana", "mulai dari mana", "bingung", atau meminta saran praktis. Jangan mengulang langkah yang sama di setiap jawaban.
Untuk pertanyaan definisi seperti "Apa itu Sains Data?", jelaskan konsepnya dulu, lalu kaitkan singkat ke profil user.
Target panjang jawaban 70-130 kata. Pakai maksimal 2 paragraf pendek, kecuali user meminta detail.`
}

func buildChatContext(assessment domain.Assessment, message string) string {
	return fmt.Sprintf(`Data hasil pengguna:
- Nomor balasan chat ini: %d
- Class: %s (%s)
- Ringkasan: %s
- RIASEC scores: R=%d, I=%d, A=%d, S=%d, E=%d, C=%d
- Top dimensions: %s
- Birth star: %s
- Hobby cards: %s
- Rekomendasi jurusan: %s

Pertanyaan pengguna:
%s`,
		assessment.ChatReplies+1,
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
