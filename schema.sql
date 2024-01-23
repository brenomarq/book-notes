CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) NOT NULL
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(50),
    cover TEXT
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    score INTEGER,
    finish_date CHAR(10),
    text_content TEXT,
    user_id INTEGER REFERENCES users(id),
    book_id INTEGER REFERENCES books(id)
);
