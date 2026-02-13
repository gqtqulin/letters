package handler

import "github.com/gin-gonic/gin"

func (h *Handler) Ping(c *gin.Context) {
	c.JSON(200, map[string]interface{}{
		"message": "pong",
	})
}
