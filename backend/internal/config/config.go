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
		CORSOrigins:    getenv("CORS_ORIGINS", "*"),
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
