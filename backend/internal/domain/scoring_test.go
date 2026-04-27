package domain

import "testing"

func TestScoreAnswersUsesServerAnswerKey(t *testing.T) {
	answers := map[string]QuizAnswer{
		"1": {Letter: "A"},
		"2": {Letter: "B"},
		"3": {Letter: "C"},
	}

	scores, invalid := ScoreAnswers(answers)
	if len(invalid) != 0 {
		t.Fatalf("expected no invalid answers, got %v", invalid)
	}
	if scores["R"] != 2 {
		t.Fatalf("expected R score 2, got %d", scores["R"])
	}
	if scores["I"] != 3 {
		t.Fatalf("expected I score 3, got %d", scores["I"])
	}
	if scores["E"] != 3 {
		t.Fatalf("expected E score 3 from question 3/C, got %d", scores["E"])
	}
}

func TestScoreAnswersReportsInvalidQuestions(t *testing.T) {
	_, invalid := ScoreAnswers(map[string]QuizAnswer{
		"1":  {Letter: "Z"},
		"99": {Letter: "A"},
	})
	if len(invalid) != 2 || invalid[0] != "1" || invalid[1] != "99" {
		t.Fatalf("unexpected invalid list: %v", invalid)
	}
}

func TestPickClassReturnsRIASECResult(t *testing.T) {
	result := PickClass(Scores{
		"R": 2,
		"I": 18,
		"A": 4,
		"S": 3,
		"E": 2,
		"C": 10,
	})

	if result.ID != "scholar" {
		t.Fatalf("expected scholar, got %q", result.ID)
	}
	if result.DominantLabel != "Investigative - Conventional" {
		t.Fatalf("unexpected dominant label %q", result.DominantLabel)
	}
}
