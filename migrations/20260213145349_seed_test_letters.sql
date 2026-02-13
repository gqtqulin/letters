-- +goose Up
-- +goose StatementBegin
INSERT INTO letters (title, content, from_user, is_read) VALUES
('Планы на разработку ❤️',
 '1) Добавить приложения (фото/аудио)\n 2) Добавить удаление',
 'he',
 1);
-- +goose StatementEnd