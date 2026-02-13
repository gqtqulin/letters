package services

import "letters/internal/domain"

type LetterStorage interface {
	GetAll() ([]domain.Letter, error)
	Create(letter domain.Letter) (int64, error)
	Get(id int64) (domain.Letter, error)
	Read(id int64) error
	Delete(id int64) error
}

type LetterService struct {
	storage LetterStorage
}

func NewLetterService(storage LetterStorage) *LetterService {
	return &LetterService{
		storage: storage,
	}
}

func (s *LetterService) GetAll() ([]domain.Letter, error) {
	return s.storage.GetAll()
}

func (s *LetterService) Create(letter domain.Letter) (int64, error) {
	return s.storage.Create(letter)
}

func (s *LetterService) Get(id int64) (domain.Letter, error) {
	return s.storage.Get(id)
}

func (s *LetterService) Read(id int64) error {
	return s.storage.Read(id)
}

func (s *LetterService) Delete(id int64) error {
	return s.storage.Delete(id)
}
