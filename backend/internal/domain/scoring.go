package domain

import (
	"sort"
	"strings"
)

var Dimensions = []string{"R", "I", "A", "S", "E", "C"}

type answerMeta struct {
	Dimension string
	Points    int
}

var AnswerKey = map[string]map[string]answerMeta{
	"1": {
		"A": {Dimension: "R", Points: 2},
		"B": {Dimension: "I", Points: 2},
		"C": {Dimension: "A", Points: 2},
		"D": {Dimension: "S", Points: 2},
	},
	"2": {
		"A": {Dimension: "R", Points: 2},
		"B": {Dimension: "I", Points: 3},
		"C": {Dimension: "E", Points: 2},
		"D": {Dimension: "C", Points: 2},
	},
	"3": {
		"A": {Dimension: "A", Points: 2},
		"B": {Dimension: "S", Points: 2},
		"C": {Dimension: "E", Points: 3},
		"D": {Dimension: "C", Points: 2},
	},
	"4": {
		"A": {Dimension: "R", Points: 2},
		"B": {Dimension: "I", Points: 2},
		"C": {Dimension: "A", Points: 1},
		"D": {Dimension: "E", Points: 3},
	},
	"5": {
		"A": {Dimension: "R", Points: 3},
		"B": {Dimension: "S", Points: 1},
		"C": {Dimension: "E", Points: 2},
		"D": {Dimension: "C", Points: 2},
	},
	"6": {
		"A": {Dimension: "I", Points: 3},
		"B": {Dimension: "A", Points: 1},
		"C": {Dimension: "S", Points: 2},
		"D": {Dimension: "C", Points: 2},
	},
	"7": {
		"A": {Dimension: "R", Points: 2},
		"B": {Dimension: "I", Points: 2},
		"C": {Dimension: "A", Points: 3},
		"D": {Dimension: "S", Points: 1},
	},
	"8": {
		"A": {Dimension: "R", Points: 2},
		"B": {Dimension: "I", Points: 2},
		"C": {Dimension: "E", Points: 2},
		"D": {Dimension: "C", Points: 2},
	},
	"9": {
		"A": {Dimension: "A", Points: 2},
		"B": {Dimension: "S", Points: 2},
		"C": {Dimension: "E", Points: 2},
		"D": {Dimension: "C", Points: 3},
	},
	"10": {
		"A": {Dimension: "R", Points: 2},
		"B": {Dimension: "I", Points: 2},
		"C": {Dimension: "A", Points: 2},
		"D": {Dimension: "E", Points: 2},
	},
	"11": {
		"A": {Dimension: "R", Points: 1},
		"B": {Dimension: "S", Points: 2},
		"C": {Dimension: "E", Points: 2},
		"D": {Dimension: "C", Points: 3},
	},
	"12": {
		"A": {Dimension: "I", Points: 2},
		"B": {Dimension: "A", Points: 2},
		"C": {Dimension: "S", Points: 3},
		"D": {Dimension: "C", Points: 2},
	},
	"13": {
		"A": {Dimension: "R", Points: 2},
		"B": {Dimension: "I", Points: 2},
		"C": {Dimension: "A", Points: 2},
		"D": {Dimension: "S", Points: 2},
	},
	"14": {
		"A": {Dimension: "R", Points: 2},
		"B": {Dimension: "E", Points: 2},
		"C": {Dimension: "S", Points: 2},
		"D": {Dimension: "C", Points: 2},
	},
	"15": {
		"A": {Dimension: "I", Points: 2},
		"B": {Dimension: "A", Points: 2},
		"C": {Dimension: "E", Points: 2},
		"D": {Dimension: "C", Points: 3},
	},
}

var HobbyCardBonuses = map[string]Scores{
	"fighter":  {"R": 2, "E": 1},
	"scholar":  {"I": 2, "C": 1},
	"artist":   {"A": 2, "S": 1},
	"guardian": {"S": 2, "I": 1},
	"leader":   {"E": 2, "S": 1},
	"keeper":   {"C": 2, "I": 1},
}

var BirthStarBonuses = map[string]Scores{
	"ignis":  {"R": 1, "E": 1},
	"aqua":   {"S": 1, "I": 1},
	"terra":  {"C": 1, "R": 1},
	"ventus": {"A": 1, "I": 1},
}

type classProfile struct {
	Result  ClassResult
	Profile map[string]float64
}

var classProfiles = []classProfile{
	{
		Result: ClassResult{
			ID:                 "knight",
			Name:               "The Knight of Arcadia",
			Title:              "Penjaga Jalan Nyata",
			Color:              "#c86030",
			DominantDimensions: []string{"R", "E"},
			Summary:            "Kamu cenderung menyukai pekerjaan yang jelas, berdampak nyata, dan memberi ruang untuk mengambil keputusan di lapangan.",
			Strengths:          []string{"Eksekusi cepat", "Tahan tekanan", "Berani mengambil peran"},
			Majors:             []string{"Teknik Sipil", "Teknik Mesin", "Teknik Industri", "Arsitektur", "Manajemen"},
		},
		Profile: map[string]float64{"R": 0.95, "I": 0.42, "A": 0.22, "S": 0.46, "E": 0.78, "C": 0.58},
	},
	{
		Result: ClassResult{
			ID:                 "scholar",
			Name:               "The Scholar of Arcadia",
			Title:              "Penafsir Gulungan Langit",
			Color:              "#5070c8",
			DominantDimensions: []string{"I", "C"},
			Summary:            "Kamu kuat saat mengurai masalah, meneliti kemungkinan, dan membuat keputusan dari bukti yang rapi.",
			Strengths:          []string{"Rasa ingin tahu", "Analisis mendalam", "Ketelitian berpikir"},
			Majors:             []string{"Sains Data", "Statistika", "Fisika", "Teknik Komputer", "Biologi Molekuler"},
		},
		Profile: map[string]float64{"R": 0.34, "I": 0.96, "A": 0.50, "S": 0.48, "E": 0.34, "C": 0.78},
	},
	{
		Result: ClassResult{
			ID:                 "bard",
			Name:               "The Bard of Arcadia",
			Title:              "Penyair Bintang",
			Color:              "#d85878",
			DominantDimensions: []string{"A", "S"},
			Summary:            "Kamu membawa energi kreatif yang kuat, terutama saat ide perlu menjadi cerita, visual, pengalaman, atau ekspresi.",
			Strengths:          []string{"Imajinasi", "Empati artistik", "Komunikasi emosional"},
			Majors:             []string{"Desain Komunikasi Visual", "Film", "Sastra", "Musik", "Arsitektur"},
		},
		Profile: map[string]float64{"R": 0.25, "I": 0.48, "A": 0.98, "S": 0.70, "E": 0.52, "C": 0.24},
	},
	{
		Result: ClassResult{
			ID:                 "healer",
			Name:               "The Healer of Arcadia",
			Title:              "Penjaga Cahaya",
			Color:              "#40a070",
			DominantDimensions: []string{"S", "I"},
			Summary:            "Kamu kuat dalam memahami orang lain, membantu dengan sabar, dan membangun lingkungan yang membuat orang bertumbuh.",
			Strengths:          []string{"Kepekaan sosial", "Kesabaran", "Mendampingi orang lain"},
			Majors:             []string{"Kedokteran", "Psikologi", "Keperawatan", "Pendidikan", "Kesehatan Masyarakat"},
		},
		Profile: map[string]float64{"R": 0.42, "I": 0.64, "A": 0.42, "S": 0.98, "E": 0.46, "C": 0.55},
	},
	{
		Result: ClassResult{
			ID:                 "commander",
			Name:               "The Commander of Arcadia",
			Title:              "Pengarah Panji Kerajaan",
			Color:              "#a050c8",
			DominantDimensions: []string{"E", "R"},
			Summary:            "Kamu cocok dengan tantangan yang membutuhkan persuasi, strategi, kepemimpinan, dan keberanian mengambil inisiatif.",
			Strengths:          []string{"Memimpin tim", "Negosiasi", "Membaca peluang"},
			Majors:             []string{"Manajemen", "Ilmu Komunikasi", "Bisnis", "Hubungan Internasional", "Hukum"},
		},
		Profile: map[string]float64{"R": 0.72, "I": 0.42, "A": 0.36, "S": 0.52, "E": 0.98, "C": 0.58},
	},
	{
		Result: ClassResult{
			ID:                 "merchant",
			Name:               "The Merchant of Arcadia",
			Title:              "Perangkai Jalur Dagang",
			Color:              "#c8a030",
			DominantDimensions: []string{"C", "E"},
			Summary:            "Kamu nyaman dengan sistem, angka, alur kerja, dan keputusan yang membutuhkan keteraturan serta tanggung jawab.",
			Strengths:          []string{"Organisasi", "Perencanaan", "Konsistensi"},
			Majors:             []string{"Akuntansi", "Administrasi Bisnis", "Ekonomi", "Sistem Informasi", "Logistik"},
		},
		Profile: map[string]float64{"R": 0.45, "I": 0.54, "A": 0.24, "S": 0.42, "E": 0.72, "C": 0.98},
	},
	{
		Result: ClassResult{
			ID:                 "mage",
			Name:               "The Mage of Arcadia",
			Title:              "Peramu Cahaya Rahasia",
			Color:              "#8b54d8",
			DominantDimensions: []string{"A", "I"},
			Summary:            "Kamu kuat saat eksplorasi kreatif bertemu eksperimen, konsep, teknologi, atau bentuk pemecahan masalah yang tidak biasa.",
			Strengths:          []string{"Eksperimen", "Konsep orisinal", "Belajar mandiri"},
			Majors:             []string{"Game Design", "Desain Produk", "Informatika", "Animasi", "Arsitektur"},
		},
		Profile: map[string]float64{"R": 0.28, "I": 0.78, "A": 0.96, "S": 0.48, "E": 0.42, "C": 0.38},
	},
	{
		Result: ClassResult{
			ID:                 "alchemist",
			Name:               "The Alchemist of Arcadia",
			Title:              "Pengubah Bahan Menjadi Makna",
			Color:              "#50a8b8",
			DominantDimensions: []string{"I", "R"},
			Summary:            "Kamu tertarik pada cara kerja sesuatu, baik lewat eksperimen, teknologi, riset, maupun pengembangan solusi yang konkret.",
			Strengths:          []string{"Eksperimen teknis", "Problem solving", "Ketahanan riset"},
			Majors:             []string{"Teknik Kimia", "Farmasi", "Bioteknologi", "Teknik Elektro", "Teknologi Pangan"},
		},
		Profile: map[string]float64{"R": 0.72, "I": 0.96, "A": 0.42, "S": 0.34, "E": 0.38, "C": 0.64},
	},
}

func BlankScores() Scores {
	scores := Scores{}
	for _, dim := range Dimensions {
		scores[dim] = 0
	}
	return scores
}

func ScoreAnswers(answers map[string]QuizAnswer) (Scores, []string) {
	scores := BlankScores()
	var invalid []string

	for questionID, answer := range answers {
		letter := strings.ToUpper(strings.TrimSpace(answer.Letter))
		choices, ok := AnswerKey[questionID]
		if !ok {
			invalid = append(invalid, questionID)
			continue
		}
		meta, ok := choices[letter]
		if !ok {
			invalid = append(invalid, questionID)
			continue
		}
		scores[meta.Dimension] += meta.Points
	}

	sort.Strings(invalid)
	return scores, invalid
}

func ScoreAssessment(answers map[string]QuizAnswer, hobbyCards []string, birthStar string) (Scores, []string) {
	scores, invalid := ScoreAnswers(answers)
	ApplyPersonalizationBonuses(scores, hobbyCards, birthStar)
	return scores, invalid
}

func ApplyPersonalizationBonuses(scores Scores, hobbyCards []string, birthStar string) {
	for _, card := range hobbyCards {
		applyBonus(scores, HobbyCardBonuses[strings.ToLower(strings.TrimSpace(card))])
	}
	applyBonus(scores, BirthStarBonuses[strings.ToLower(strings.TrimSpace(birthStar))])
}

func applyBonus(scores Scores, bonus Scores) {
	for dim, points := range bonus {
		if contains(Dimensions, dim) {
			scores[dim] += points
		}
	}
}

func TopDimensions(scores Scores) []string {
	top := append([]string(nil), Dimensions...)
	sort.SliceStable(top, func(i, j int) bool {
		return scores[top[i]] > scores[top[j]]
	})
	return top
}

func ClassCatalog() []ClassResult {
	results := make([]ClassResult, 0, len(classProfiles))
	for _, profile := range classProfiles {
		result := profile.Result
		result.DominantLabel = dominantLabel(result.DominantDimensions)
		results = append(results, result)
	}
	return results
}

func PickClass(scores Scores) ClassResult {
	normalized := normalizeScores(scores)
	top := TopDimensions(scores)
	bestScore := -1.0
	best := classProfiles[0]

	for _, candidate := range classProfiles {
		fit := 0.0
		for _, dim := range Dimensions {
			fit += normalized[dim] * candidate.Profile[dim]
		}
		for _, dim := range top[:2] {
			if contains(candidate.Result.DominantDimensions, dim) {
				fit += 0.35
			}
		}
		if fit > bestScore {
			bestScore = fit
			best = candidate
		}
	}

	result := best.Result
	result.DominantLabel = dominantLabel(top[:2])
	return result
}

func normalizeScores(scores Scores) map[string]float64 {
	maxScore := 1
	for _, dim := range Dimensions {
		if scores[dim] > maxScore {
			maxScore = scores[dim]
		}
	}

	normalized := map[string]float64{}
	for _, dim := range Dimensions {
		normalized[dim] = float64(scores[dim]) / float64(maxScore)
	}
	return normalized
}

func dominantLabel(dims []string) string {
	names := map[string]string{
		"R": "Realistic",
		"I": "Investigative",
		"A": "Artistic",
		"S": "Social",
		"E": "Enterprising",
		"C": "Conventional",
	}
	parts := make([]string, 0, len(dims))
	for _, dim := range dims {
		parts = append(parts, names[dim])
	}
	return strings.Join(parts, " - ")
}

func contains(values []string, needle string) bool {
	for _, value := range values {
		if value == needle {
			return true
		}
	}
	return false
}
