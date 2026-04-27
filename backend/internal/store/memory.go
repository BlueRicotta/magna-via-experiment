package store

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"sync"

	"magnavia/backend/internal/domain"
)

var ErrNotFound = errors.New("not found")

type Memory struct {
	mu          sync.RWMutex
	assessments map[string]domain.Assessment
}

func NewMemory() *Memory {
	return &Memory{
		assessments: map[string]domain.Assessment{},
	}
}

func (m *Memory) SaveAssessment(assessment domain.Assessment) domain.Assessment {
	m.mu.Lock()
	defer m.mu.Unlock()

	if assessment.ID == "" {
		assessment.ID = newID()
	}
	m.assessments[assessment.ID] = assessment
	return assessment
}

func (m *Memory) GetAssessment(id string) (domain.Assessment, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	assessment, ok := m.assessments[id]
	if !ok {
		return domain.Assessment{}, ErrNotFound
	}
	return assessment, nil
}

func (m *Memory) ListAssessments() []domain.Assessment {
	m.mu.RLock()
	defer m.mu.RUnlock()

	assessments := make([]domain.Assessment, 0, len(m.assessments))
	for _, assessment := range m.assessments {
		assessments = append(assessments, assessment)
	}
	return assessments
}

func newID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b[:])
}
