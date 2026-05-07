package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port               string
	AdminToken         string
	AdminUsername      string
	AdminPassword      string
	AdminSessionSecret string
	DatabaseDriver     string
	DatabaseDSN        string
	CORSOrigins        string
	OpenAIAPIKey       string
	OpenAIModel        string
	OpenAIBaseURL      string
	ChatEnabled        bool
	ChatReplyLimit     int
}

func Load() Config {
	driver := getenv("DB_DRIVER", "sqlite")
	return Config{
		Port:               getenv("PORT", "8080"),
		AdminToken:         os.Getenv("ADMIN_TOKEN"),
		AdminUsername:      getenv("ADMIN_USERNAME", "admin"),
		AdminPassword:      os.Getenv("ADMIN_PASSWORD"),
		AdminSessionSecret: os.Getenv("ADMIN_SESSION_SECRET"),
		DatabaseDriver:     driver,
		DatabaseDSN:        defaultDSN(driver),
		CORSOrigins:        getenv("CORS_ORIGINS", "*"),
		OpenAIAPIKey:       os.Getenv("OPENAI_API_KEY"),
		OpenAIModel:        getenv("OPENAI_MODEL", "gpt-4o-mini"),
		OpenAIBaseURL:      getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
		ChatEnabled:        getenvBool("CHAT_ENABLED", true),
		ChatReplyLimit:     getenvInt("CHAT_REPLY_LIMIT", 5),
	}
}

func getenv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func getenvBool(key string, fallback bool) bool {
	value := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
	if value == "" {
		return fallback
	}
	return value == "1" || value == "true" || value == "yes" || value == "on"
}

func getenvInt(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}

func defaultDSN(driver string) string {
	if dsn := strings.TrimSpace(os.Getenv("DATABASE_DSN")); dsn != "" {
		return dsn
	}
	if dsn := strings.TrimSpace(os.Getenv("MYSQL_DSN")); dsn != "" {
		return dsn
	}
	if strings.EqualFold(driver, "sqlite") {
		return "tmp/magna-via.db"
	}
	return ""
}
