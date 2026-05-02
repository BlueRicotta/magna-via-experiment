package main

import (
	"log"

	"magnavia/backend/internal/ai"
	"magnavia/backend/internal/config"
	"magnavia/backend/internal/database"
	"magnavia/backend/internal/server"
	"magnavia/backend/internal/store"
)

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg)
	if err != nil {
		log.Fatal(err)
	}

	var chatGenerator ai.ChatGenerator
	if cfg.OpenAIAPIKey != "" {
		chatGenerator = ai.NewOpenAIClient(cfg.OpenAIAPIKey, cfg.OpenAIModel, cfg.OpenAIBaseURL)
	}

	app := server.New(
		store.NewGorm(db),
		cfg.CORSOrigins,
		server.WithAdminToken(cfg.AdminToken),
		server.WithAdminAuth(cfg.AdminUsername, cfg.AdminPassword, cfg.AdminSessionSecret),
		server.WithChatSettings(cfg.ChatEnabled, cfg.ChatReplyLimit),
		server.WithChatGenerator(chatGenerator),
	)

	log.Printf("Magna Via API listening on :%s (%s)", cfg.Port, cfg.DatabaseDriver)
	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
