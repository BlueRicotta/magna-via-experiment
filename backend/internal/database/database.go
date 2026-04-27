package database

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"magnavia/backend/internal/config"
	"magnavia/backend/internal/store"
)

func Open(cfg config.Config) (*gorm.DB, error) {
	var dialector gorm.Dialector
	switch strings.ToLower(cfg.DatabaseDriver) {
	case "mysql":
		if strings.TrimSpace(cfg.DatabaseDSN) == "" {
			return nil, errors.New("DATABASE_DSN or MYSQL_DSN is required when DB_DRIVER=mysql")
		}
		dialector = mysql.Open(cfg.DatabaseDSN)
	case "sqlite":
		if err := os.MkdirAll(filepath.Dir(cfg.DatabaseDSN), 0o755); err != nil {
			return nil, err
		}
		dialector = sqlite.Open(cfg.DatabaseDSN)
	default:
		return nil, fmt.Errorf("unsupported DB_DRIVER %q", cfg.DatabaseDriver)
	}

	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, err
	}

	if err := store.AutoMigrate(db); err != nil {
		return nil, err
	}
	return db, nil
}
