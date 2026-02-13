package main

import (
	"context"
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"letters/internal/config"
	"letters/internal/handler"
	"letters/internal/server"
	services "letters/internal/service"
	storages "letters/internal/storage"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	log := initLogger()

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Error("config not loaded")
		os.Exit(1)
	}

	db, err := sql.Open("sqlite3", cfg.DBPath)
	if err != nil {
		log.Error(err.Error())
		os.Exit(1)
	}

	if err := db.Ping(); err != nil {
		log.Error(err.Error())
		os.Exit(1)
	}

	letterStorage := storages.NewLetterStorage(db)

	letterService := services.NewLetterService(letterStorage)

	hand := handler.NewHandler(log, letterService, cfg.TokenSecret)

	srv := server.Server{}
	go func() {
		if err := srv.Run(cfg.ServerPort, hand.InitRoutes()); err != nil {
			log.Error("failed to start server", "error", err)
			os.Exit(1)
		}
	}()

	log.Info("server started")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	if err := srv.Shutdown(context.Background()); err != nil {
		log.Info("failed to shutdown server", "error", err)
		os.Exit(1)
	}

	if err := db.Close(); err != nil {
		log.Info("failed to close connection", "error", err)
		os.Exit(1)
	}
}

func initLogger() *slog.Logger {
	slogHandler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		AddSource: true,
		Level:     slog.LevelInfo,
	})

	return slog.New(slogHandler)
}
