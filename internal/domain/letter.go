package domain

import "time"

type From string

const (
	He  From = "He"
	She From = "She"
)

type Letter struct {
	Id        int64     `json:"id" omitempty:"true"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	From      From      `json:"from_user"`
	IsRead    bool      `json:"is_read" default:"false"`
	CreatedAt time.Time `json:"created_at" omitempty:"true"`
}
