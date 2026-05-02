package store

import (
	"context"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestIncrementChatReplyCountHandlesNullLegacyValues(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.Exec(`CREATE TABLE assessment_models (id text primary key, chat_replies integer NULL)`).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Exec(`INSERT INTO assessment_models (id, chat_replies) VALUES (?, NULL)`, "legacy-assessment").Error; err != nil {
		t.Fatal(err)
	}

	store := NewGorm(db)
	if err := store.IncrementChatReplyCount(context.Background(), "legacy-assessment"); err != nil {
		t.Fatal(err)
	}

	var count int
	if err := db.Raw(`SELECT chat_replies FROM assessment_models WHERE id = ?`, "legacy-assessment").Scan(&count).Error; err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Fatalf("expected chat_replies to increment from NULL to 1, got %d", count)
	}
}
