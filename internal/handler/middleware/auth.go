package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"github.com/gin-gonic/gin"
	"letters/internal/handler/response"
	"net/http"
	"strings"
)

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			response.ErrorResponse(c, http.StatusUnauthorized, "token format error")
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		token = strings.TrimSpace(token)

		expectedBytes := sha256.Sum256([]byte(secret))
		expectedHash := hex.EncodeToString(expectedBytes[:])

		if token != expectedHash {
			response.ErrorResponse(c, http.StatusUnauthorized, "token invalid")
			return
		}

		c.Next()
	}
}
