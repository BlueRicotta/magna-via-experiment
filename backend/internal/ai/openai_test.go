package ai

import (
	"encoding/json"
	"testing"
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
