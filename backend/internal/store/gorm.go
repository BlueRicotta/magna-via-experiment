package store

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"magnavia/backend/internal/domain"
)

type AssessmentStore interface {
	SaveAssessment(ctx context.Context, assessment domain.Assessment) (domain.Assessment, error)
	GetAssessment(ctx context.Context, id string) (domain.Assessment, error)
	ListAssessments(ctx context.Context) ([]domain.Assessment, error)
	ChatReplyCount(ctx context.Context, assessmentID string) (int, error)
	IncrementChatReplyCount(ctx context.Context, assessmentID string) error
	SaveChatMessage(ctx context.Context, message ChatMessage) error
}

type GormStore struct {
	db *gorm.DB
}

type AssessmentModel struct {
	ID        string    `gorm:"primaryKey;size:36"`
	CreatedAt time.Time `gorm:"index"`
	UpdatedAt time.Time

	FullName string `gorm:"size:160;index"`
	Age      string `gorm:"size:24"`
	Grade    string `gorm:"size:64;index"`
	School   string `gorm:"size:180"`
	Email    string `gorm:"size:180;index"`
	Gender   string `gorm:"size:32"`

	HobbyCards  StringSlice   `gorm:"type:longtext"`
	BirthStar   string        `gorm:"size:32;index"`
	QuizAnswers QuizAnswerMap `gorm:"type:longtext"`
	Scores      ScoresMap     `gorm:"type:longtext"`

	TopDimensions StringSlice `gorm:"type:longtext"`

	ResultID                 string      `gorm:"size:64;index"`
	ResultName               string      `gorm:"size:160"`
	ResultTitle              string      `gorm:"size:160"`
	ResultColor              string      `gorm:"size:32"`
	ResultDominantDimensions StringSlice `gorm:"type:longtext"`
	ResultDominantLabel      string      `gorm:"size:160"`
	ResultSummary            string      `gorm:"type:text"`
	ResultStrengths          StringSlice `gorm:"type:longtext"`
	ResultMajors             StringSlice `gorm:"type:longtext"`

	ChatReplies int `gorm:"not null;default:0"`
}

type ChatMessage struct {
	ID           string    `json:"id"`
	AssessmentID string    `json:"assessmentId"`
	Sender       string    `json:"sender"`
	Message      string    `json:"message"`
	CreatedAt    time.Time `json:"createdAt"`
}

type ChatMessageModel struct {
	ID           string    `gorm:"primaryKey;size:36"`
	AssessmentID string    `gorm:"size:36;index"`
	Sender       string    `gorm:"size:32;index"`
	Message      string    `gorm:"type:text"`
	CreatedAt    time.Time `gorm:"index"`
}

type StringSlice []string
type QuizAnswerMap map[string]domain.QuizAnswer
type ScoresMap map[string]int

func NewGorm(db *gorm.DB) *GormStore {
	return &GormStore{db: db}
}

func AutoMigrate(db *gorm.DB) error {
	if err := db.AutoMigrate(&AssessmentModel{}, &ChatMessageModel{}); err != nil {
		return err
	}
	return db.Model(&AssessmentModel{}).
		Where("chat_replies IS NULL").
		Update("chat_replies", 0).Error
}

func (s *GormStore) SaveAssessment(ctx context.Context, assessment domain.Assessment) (domain.Assessment, error) {
	if assessment.ID == "" {
		assessment.ID = uuid.NewString()
	}
	if assessment.CreatedAt.IsZero() {
		assessment.CreatedAt = time.Now().UTC()
	}

	model := assessmentToModel(assessment)
	if err := s.db.WithContext(ctx).Create(&model).Error; err != nil {
		return domain.Assessment{}, err
	}
	return modelToAssessment(model), nil
}

func (s *GormStore) GetAssessment(ctx context.Context, id string) (domain.Assessment, error) {
	var model AssessmentModel
	if err := s.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Assessment{}, ErrNotFound
		}
		return domain.Assessment{}, err
	}
	return modelToAssessment(model), nil
}

func (s *GormStore) ListAssessments(ctx context.Context) ([]domain.Assessment, error) {
	var models []AssessmentModel
	if err := s.db.WithContext(ctx).Order("created_at desc").Find(&models).Error; err != nil {
		return nil, err
	}

	assessments := make([]domain.Assessment, 0, len(models))
	for _, model := range models {
		assessments = append(assessments, modelToAssessment(model))
	}
	return assessments, nil
}

func (s *GormStore) ChatReplyCount(ctx context.Context, assessmentID string) (int, error) {
	var model AssessmentModel
	if err := s.db.WithContext(ctx).Select("chat_replies").First(&model, "id = ?", assessmentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, ErrNotFound
		}
		return 0, err
	}
	return model.ChatReplies, nil
}

func (s *GormStore) IncrementChatReplyCount(ctx context.Context, assessmentID string) error {
	result := s.db.WithContext(ctx).
		Model(&AssessmentModel{}).
		Where("id = ?", assessmentID).
		UpdateColumn("chat_replies", gorm.Expr("COALESCE(chat_replies, 0) + ?", 1))
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *GormStore) SaveChatMessage(ctx context.Context, message ChatMessage) error {
	if message.ID == "" {
		message.ID = uuid.NewString()
	}
	if message.CreatedAt.IsZero() {
		message.CreatedAt = time.Now().UTC()
	}
	return s.db.WithContext(ctx).Create(&ChatMessageModel{
		ID:           message.ID,
		AssessmentID: message.AssessmentID,
		Sender:       message.Sender,
		Message:      message.Message,
		CreatedAt:    message.CreatedAt,
	}).Error
}

func assessmentToModel(assessment domain.Assessment) AssessmentModel {
	return AssessmentModel{
		ID:        assessment.ID,
		CreatedAt: assessment.CreatedAt,

		FullName: assessment.Biodata.FullName,
		Age:      assessment.Biodata.Age,
		Grade:    assessment.Biodata.Grade,
		School:   assessment.Biodata.School,
		Email:    assessment.Biodata.Email,
		Gender:   assessment.Biodata.Gender,

		HobbyCards:  StringSlice(assessment.HobbyCards),
		BirthStar:   assessment.BirthStar,
		QuizAnswers: QuizAnswerMap(assessment.QuizAnswers),
		Scores:      ScoresMap(assessment.Scores),

		TopDimensions: StringSlice(assessment.TopDimensions),

		ResultID:                 assessment.Result.ID,
		ResultName:               assessment.Result.Name,
		ResultTitle:              assessment.Result.Title,
		ResultColor:              assessment.Result.Color,
		ResultDominantDimensions: StringSlice(assessment.Result.DominantDimensions),
		ResultDominantLabel:      assessment.Result.DominantLabel,
		ResultSummary:            assessment.Result.Summary,
		ResultStrengths:          StringSlice(assessment.Result.Strengths),
		ResultMajors:             StringSlice(assessment.Result.Majors),
		ChatReplies:              assessment.ChatReplies,
	}
}

func modelToAssessment(model AssessmentModel) domain.Assessment {
	return domain.Assessment{
		ID:        model.ID,
		CreatedAt: model.CreatedAt,
		Biodata: domain.Biodata{
			FullName: model.FullName,
			Age:      model.Age,
			Grade:    model.Grade,
			School:   model.School,
			Email:    model.Email,
			Gender:   model.Gender,
		},
		HobbyCards:    []string(model.HobbyCards),
		BirthStar:     model.BirthStar,
		QuizAnswers:   map[string]domain.QuizAnswer(model.QuizAnswers),
		Scores:        domain.Scores(model.Scores),
		TopDimensions: []string(model.TopDimensions),
		ChatReplies:   model.ChatReplies,
		Result: domain.ClassResult{
			ID:                 model.ResultID,
			Name:               model.ResultName,
			Title:              model.ResultTitle,
			Color:              model.ResultColor,
			DominantDimensions: []string(model.ResultDominantDimensions),
			DominantLabel:      model.ResultDominantLabel,
			Summary:            model.ResultSummary,
			Strengths:          []string(model.ResultStrengths),
			Majors:             []string(model.ResultMajors),
		},
	}
}

func (s StringSlice) Value() (driver.Value, error) {
	return jsonValue(s)
}

func (s *StringSlice) Scan(value any) error {
	return jsonScan(value, s)
}

func (m QuizAnswerMap) Value() (driver.Value, error) {
	return jsonValue(m)
}

func (m *QuizAnswerMap) Scan(value any) error {
	return jsonScan(value, m)
}

func (m ScoresMap) Value() (driver.Value, error) {
	return jsonValue(m)
}

func (m *ScoresMap) Scan(value any) error {
	return jsonScan(value, m)
}

func jsonValue(value any) (driver.Value, error) {
	b, err := json.Marshal(value)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func jsonScan(value any, dest any) error {
	if value == nil {
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("cannot scan JSON value of type %T", value)
	}
	return json.Unmarshal(bytes, dest)
}
