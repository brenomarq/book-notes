import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { password } from "./secret.js"; // You can delete this line

// Native API
const app = express();
const port = 4000;

// Initialize connection to the database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_notes", // Here you can place the name you gave to the database
  password: password, // Here you can place your postgres password
  port: 5432,
});
db.connect();

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Users HTTP Methods
// This one list all of the existing users
app.get("/users", async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM users`);
    res.json(users.rows);
  } catch (err) {
    console.log(err);
    res.json({ error: "Could not connect properly to the database." });
  }
});

// This creates a new user
app.post("/users", async (req, res) => {
  try {
    const newUser = await db.query(
      `INSERT INTO users (username) VALUES ($1) RETURNING *`,
      [req.body.username]
    );
    res.json(newUser.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "It was not possible to create a new user" });
  }
});

// This deletes an existing user
app.delete("/users/:id", async (req, res) => {
  const selectedId = parseInt(req.params.id);

  try {
    await db.query(`DELETE FROM users Where id=$1`, [selectedId]);
    res.json({ message: `User with id ${selectedId} deleted successfully!` });
  } catch (err) {
    console.log(err);
    res.json({ error: "Unsuccessul action! The user was not found." });
  }
});

// Books HTTP methods
// List all the stored books
app.get("/books", async (req, res) => {
  try {
    const books = await db.query(`
        SELECT * FROM books;`);
    res.json(books.rows);
  } catch (err) {
    console.log(err);
    res.json({
      error: "Couldn't find the requested data. User or book does not exist.",
    });
  }
});

// Adds a new book
app.post("/books", async (req, res) => {
  try {
    const newBook = await db.query(
      `
        INSERT INTO books (title, author, cover)
        VALUES ($1, $2, $3) RETURNING *`,
      [req.body.title, req.body.author, req.body.cover]
    );
    res.json(newBook.rows);
  } catch (err) {
    console.log(err);
    res.json({ error: "Could not create a new record on the database." });
  }
});

// Review HTTP Methods
// list all the book reviews from a certain user
app.get("/reviews/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const reviews = await db.query(
      `
        SELECT title, author, cover, score, finish_date, text_content, book_id
        FROM reviews
        JOIN users ON users.id=user_id
        JOIN books ON books.id=book_id
        WHERE user_id=$1
        ORDER BY book_id ASC`,
      [userId]
    );
    res.json(reviews.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Could not complete the action." });
  }
});

// Creates a new review for a book
app.post("/reviews", async (req, res) => {
  const userId = parseInt(req.body.user_id);
  const bookId = parseInt(req.body.book_id);

  try {
    const newReview = await db.query(
      `
        INSERT INTO reviews (score, finish_date, text_content, user_id, book_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.body.score,
        req.body.finish_date,
        req.body.text_content,
        userId,
        bookId,
      ]
    );
    res.json(newReview.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Could not create the review, try again." });
  }
});

// Updates an existing review
app.put("/reviews", async (req, res) => {
  const bookId = parseInt(req.body.book_id);
  const userId = parseInt(req.body.user_id);

  try {
    const updatedReview = await db.query(
      `
        UPDATE reviews
        SET score=$1, finish_date=$2, text_content=$3
        WHERE user_id=$4 AND book_id=$5
        RETURNING *`,
      [req.body.score, req.body.finish, req.body.opinion, userId, bookId]
    );
    res.json(updatedReview.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Could not update the review, try again." });
  }
});

// Deletes an existing review
app.delete("/reviews", async (req, res) => {
  const bookId = parseInt(req.body.book);
  const userId = parseInt(req.body.user);

  try {
    await db.query(`DELETE FROM reviews WHERE book_id=$1 AND user_id=$2`, [
      bookId,
      userId,
    ]);
    res.json({ message: "Review deleted successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Coult not delete the review, try again." });
  }
});

app.listen(port, () => {
  console.log(`Server running successfully on port ${port}`);
});
