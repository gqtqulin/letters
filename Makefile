# Makefile для миграций (только up/down)
.PHONY: up down status reset

# Загружаем .env
include .env
export $(shell sed 's/=.*//' .env 2>/dev/null)

DB_PATH ?= ./db/site.db
MIGRATIONS_DIR ?= migrations

# 📈 Up — применить миграции
migrate-up:
	mkdir -p $(dir $(DB_PATH))
	goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) up-by-one
	@echo "✅ Миграции применены: $(DB_PATH)"

# 📉 Down — откат миграции  
migrate-down:
	goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) down-by-one
	@echo "✅ Миграция откатана"