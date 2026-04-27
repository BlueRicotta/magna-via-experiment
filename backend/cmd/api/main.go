package main

import (
	"log"
	"net/http"
	"os"

	"magnavia/backend/internal/server"
)

func main() {
	addr := ":" + getenv("PORT", "8080")
	handler := server.New(server.WithAdminToken(os.Getenv("ADMIN_TOKEN")))

	log.Printf("Magna Via API listening on %s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
	}
}

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
