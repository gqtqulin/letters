package handler

import (
	"github.com/gin-gonic/gin"
	"letters/internal/domain"
	"letters/internal/handler/middleware"
	"log/slog"
)

type LetterService interface {
	GetAll() ([]domain.Letter, error)
	Create(domain.Letter) (int64, error)
	Get(id int64) (domain.Letter, error)
	Read(id int64) error
	Delete(id int64) error
}

type Handler struct {
	letterService LetterService
	log           *slog.Logger
	tokenSecret   string
}

func NewHandler(log *slog.Logger, letterService LetterService, tokenSecret string) *Handler {
	return &Handler{
		letterService: letterService,
		log:           log,
		tokenSecret:   tokenSecret,
	}
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()

	//router.LoadHTMLGlob("frontend/*.html")
	router.Static("/frontend", "./frontend")
	router.GET("/", func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	router.GET("/ping", h.Ping)

	api := router.Group("/api")
	{

		api.Use(middleware.AuthMiddleware(h.tokenSecret))

		letters := api.Group("/letters")
		{
			letters.GET("/", h.GetAllLetters)
			letters.GET("/:id", h.GetLetter)
			letters.POST("/", h.CreateLetter)
			letters.PUT("/:id/read", h.ReadLetter)
			letters.DELETE(":id", h.DeleteLetter)
		}
	}

	return router
}
