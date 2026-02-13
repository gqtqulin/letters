package storages

import (
	"database/sql"
	"letters/internal/domain"
)

type LetterStorage struct {
	db *sql.DB
}

func NewLetterStorage(db *sql.DB) *LetterStorage {
	return &LetterStorage{
		db: db,
	}
}

func (s *LetterStorage) GetAll() ([]domain.Letter, error) {
	rows, err := s.db.Query(`
        SELECT id, title, content, "from_user", is_read, created_at 
        FROM letters 
        ORDER BY created_at DESC
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var letters []domain.Letter
	for rows.Next() {
		var l domain.Letter
		var fromStr string
		if err := rows.Scan(&l.Id, &l.Title, &l.Content, &fromStr, &l.IsRead, &l.CreatedAt); err != nil {
			return nil, err
		}
		l.From = domain.From(fromStr) // string → domain.From
		letters = append(letters, l)
	}
	return letters, rows.Err()
}

func (s *LetterStorage) Create(letter domain.Letter) (int64, error) {
	res, err := s.db.Exec(`
        INSERT INTO letters (title, content, "from_user", is_read, created_at)
        VALUES (?, ?, ?, ?, ?)
    `, letter.Title, letter.Content, string(letter.From), letter.IsRead, letter.CreatedAt)
	if err != nil {
		return 0, err
	}

	return res.LastInsertId()
}

func (s *LetterStorage) Get(id int64) (domain.Letter, error) {
	var l domain.Letter
	var fromStr string

	err := s.db.QueryRow(`
        SELECT id, title, content, "from_user", is_read, created_at 
        FROM letters WHERE id = ?
    `, id).Scan(&l.Id, &l.Title, &l.Content, &fromStr, &l.IsRead, &l.CreatedAt)

	if err != nil {
		return l, err
	}

	l.From = domain.From(fromStr)
	return l, nil
}

func (s *LetterStorage) Read(id int64) error {
	_, err := s.db.Exec("UPDATE letters SET is_read = 1 WHERE id = ?", id)
	return err
}

func (s *LetterStorage) Delete(id int64) error {
	_, err := s.db.Exec("DELETE FROM letters WHERE id = ?", id)
	return err
}
