package config

import (
	"os"
	"strings"
)

type Config struct {
	Port           string
	AdminToken     string
	DatabaseDriver string
	DatabaseDSN    string
	CORSOrigins    string
}

func Load() Config {
	driver := getenv("DB_DRIVER", "sqlite")
	return Config{
		Port:           getenv("PORT", "8080"),
		AdminToken:     os.Getenv("ADMIN_TOKEN"),
		DatabaseDriver: driver,
		DatabaseDSN:    defaultDSN(driver),
		CORSOrigins:    normalizeCORSOrigins(getenv("CORS_ORIGINS", "*")),
	}
}

func getenv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
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

func normalizeCORSOrigins(value string) string {
	if strings.TrimSpace(value) == "*" {
		return "*"
	}

	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		origin := strings.TrimRight(strings.TrimSpace(part), "/")
		if origin != "" {
			origins = append(origins, origin)
		}
	}
	if len(origins) == 0 {
		return "*"
	}
	return strings.Join(origins, ",")
}
