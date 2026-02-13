-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    from_user TEXT NOT NULL CHECK(from_user IN ('he', 'she')),
    is_read BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_letters_created_at ON letters(created_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_letters_created_at;
DROP TABLE IF EXISTS letters;
-- +goose StatementEnd
