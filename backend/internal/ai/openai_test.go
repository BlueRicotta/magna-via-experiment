package ai

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"sync/atomic"
	"testing"

	"magnavia/backend/internal/domain"
)

func TestOpenAIResponseFirstTextSupportsOutputText(t *testing.T) {
	var response openAIResponse
	if err := json.Unmarshal([]byte(`{"output_text":"Jalurmu selaras dengan riset."}`), &response); err != nil {
		t.Fatal(err)
	}
	if got := response.firstText(); got != "" {
		t.Fatalf("expected firstText to ignore output_text, got %q", got)
	}
}

func TestOpenAIResponseFirstTextSupportsNestedContentText(t *testing.T) {
	var response openAIResponse
	if err := json.Unmarshal([]byte(`{
		"output": [{
			"type": "message",
			"content": [{
				"type": "output_text",
				"text": "Cenayang melihat jalur Sains Data."
			}]
		}]
	}`), &response); err != nil {
		t.Fatal(err)
	}
	if got := response.firstText(); got != "Cenayang melihat jalur Sains Data." {
		t.Fatalf("unexpected text %q", got)
	}
}

func TestOpenAIResponseFirstTextSupportsOutputTextField(t *testing.T) {
	var response openAIResponse
	if err := json.Unmarshal([]byte(`{
		"output": [{
			"type": "output_text",
			"text": "Kamu cocok menjelajah bidang analitis."
		}]
	}`), &response); err != nil {
		t.Fatal(err)
	}
	if got := response.firstText(); got != "Kamu cocok menjelajah bidang analitis." {
		t.Fatalf("unexpected text %q", got)
	}
}

func TestOpenAIResponseFirstTextSupportsLegacyValueField(t *testing.T) {
	var response openAIResponse
	if err := json.Unmarshal([]byte(`{
		"output": [{
			"content": [{
				"type": "text",
				"value": "Pilih pekerjaan yang menggabungkan data dan struktur."
			}]
		}]
	}`), &response); err != nil {
		t.Fatal(err)
	}
	if got := response.firstText(); got != "Pilih pekerjaan yang menggabungkan data dan struktur." {
		t.Fatalf("unexpected text %q", got)
	}
}

func TestOpenAIClientRetriesWhenFirstResponseHasNoVisibleText(t *testing.T) {
	var calls int32
	client := NewOpenAIClient("test-key", "gpt-5-nano", "https://example.test")
	client.httpClient = &http.Client{
		Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
			if r.URL.Path != "/responses" {
				t.Fatalf("unexpected path %s", r.URL.Path)
			}

			call := atomic.AddInt32(&calls, 1)
			if call == 1 {
				return jsonResponse(`{
				"status": "incomplete",
				"incomplete_details": {"reason": "max_output_tokens"},
				"output": [{"type": "reasoning"}],
				"usage": {"output_tokens": 1000}
			}`), nil
			}
			return jsonResponse(`{"output_text":"Kamu cocok mengeksplorasi analis data dan riset produk."}`), nil
		}),
	}

	reply, err := client.GenerateChatReply(context.Background(), domain.Assessment{
		Scores:        domain.Scores{"R": 1, "I": 8, "A": 2, "S": 3, "E": 1, "C": 5},
		TopDimensions: []string{"I", "C"},
		Result: domain.ClassResult{
			Name:          "The Scholar of Arcadia",
			DominantLabel: "Investigative-Conventional",
			Summary:       "Analitis dan terstruktur.",
			Majors:        []string{"Data Science", "Informatika"},
		},
		BirthStar:  "aqua",
		HobbyCards: []string{"scholar", "keeper"},
	}, "Pekerjaan cocok?")
	if err != nil {
		t.Fatal(err)
	}
	if reply != "Kamu cocok mengeksplorasi analis data dan riset produk." {
		t.Fatalf("unexpected reply %q", reply)
	}
	if got := atomic.LoadInt32(&calls); got != 2 {
		t.Fatalf("expected 2 OpenAI calls, got %d", got)
	}
}

func TestCenayangInstructionsDiscourageRepetitiveFollowups(t *testing.T) {
	instructions := cenayangInstructions()
	for _, want := range []string{
		"Jawab pertanyaan utama di kalimat pertama",
		"jangan membuka dengan \"Halo\"",
		"Gunakan bahasa Indonesia yang natural",
		"Jangan menyuruh user mengisi quiz/kartu/hobby lagi",
		"Berikan langkah kecil hanya jika",
	} {
		if !strings.Contains(instructions, want) {
			t.Fatalf("expected instructions to contain %q", want)
		}
	}
}

func TestBuildChatContextIncludesReplyNumber(t *testing.T) {
	context := buildChatContext(domain.Assessment{
		ChatReplies:   2,
		Scores:        domain.Scores{"R": 1, "I": 2, "A": 3, "S": 4, "E": 5, "C": 6},
		TopDimensions: []string{"C", "S"},
		Result: domain.ClassResult{
			Name:          "The Scholar of Arcadia",
			DominantLabel: "Conventional - Social",
			Summary:       "Teliti dan komunikatif.",
			Majors:        []string{"Sains Data"},
		},
		BirthStar:  "terra",
		HobbyCards: []string{"scholar"},
	}, "Apa itu Sains Data?")
	if !strings.Contains(context, "Nomor balasan chat ini: 3") {
		t.Fatalf("expected context to include reply number, got %q", context)
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) {
	return f(r)
}

func jsonResponse(body string) *http.Response {
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       io.NopCloser(strings.NewReader(body)),
	}
}
