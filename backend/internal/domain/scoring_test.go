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

func TestScoreAssessmentAppliesHobbyAndBirthStarBonuses(t *testing.T) {
	scores, invalid := ScoreAssessment(
		map[string]QuizAnswer{
			"1": {Letter: "A"},
			"2": {Letter: "B"},
			"3": {Letter: "C"},
		},
		[]string{"fighter", "leader", "keeper"},
		"ignis",
	)

	if len(invalid) != 0 {
		t.Fatalf("expected no invalid answers, got %v", invalid)
	}
	if scores["R"] != 5 {
		t.Fatalf("expected R score 5 after fighter and ignis bonuses, got %d", scores["R"])
	}
	if scores["I"] != 4 {
		t.Fatalf("expected I score 4 after keeper bonus, got %d", scores["I"])
	}
	if scores["S"] != 1 {
		t.Fatalf("expected S score 1 after leader bonus, got %d", scores["S"])
	}
	if scores["E"] != 7 {
		t.Fatalf("expected E score 7 after fighter, leader, and ignis bonuses, got %d", scores["E"])
	}
	if scores["C"] != 2 {
		t.Fatalf("expected C score 2 after keeper bonus, got %d", scores["C"])
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
