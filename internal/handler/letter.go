package handler

import (
	"database/sql"
	"errors"
	"github.com/gin-gonic/gin"
	"letters/internal/domain"
	"letters/internal/handler/response"
	"net/http"
	"strconv"
)

func (h *Handler) GetAllLetters(c *gin.Context) {
	letters, err := h.letterService.GetAll()
	if err != nil {
		response.ErrorResponse(c, http.StatusInternalServerError, "internal server error")
		h.log.Info(err.Error())
		return
	}

	c.JSON(http.StatusOK, letters)
}

func (h *Handler) CreateLetter(c *gin.Context) {
	var input domain.Letter
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ErrorResponse(c, http.StatusBadRequest, "invalid input")
		return
	}

	id, err := h.letterService.Create(input)
	if err != nil {
		response.ErrorResponse(c, http.StatusInternalServerError, "internal server error")
		h.log.Info(err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id})
}

func (h *Handler) GetLetter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.ErrorResponse(c, http.StatusBadRequest, "invalid id")
		return
	}

	letter, err := h.letterService.Get(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			response.ErrorResponse(c, http.StatusNotFound, "letter not found")
			return
		}
		response.ErrorResponse(c, http.StatusInternalServerError, "internal server error")
		h.log.Info(err.Error())
		return
	}

	c.JSON(http.StatusOK, letter)
}

func (h *Handler) ReadLetter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.ErrorResponse(c, http.StatusBadRequest, "invalid id")
		return
	}

	if err := h.letterService.Read(id); err != nil {
		response.ErrorResponse(c, http.StatusInternalServerError, "internal server error")
		h.log.Info(err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "success"})
}

func (h *Handler) DeleteLetter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.ErrorResponse(c, http.StatusBadRequest, "invalid id")
		return
	}

	if err := h.letterService.Delete(id); err != nil {
		response.ErrorResponse(c, http.StatusInternalServerError, "internal server error")
		h.log.Info(err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "success"})
}
