import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { password } from "./secret.js";

// Native API
const app = express();
const port = 4000;

// Initialize connection to the database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book_notes",
    password: password,
    port: 5432,
})
db.connect();

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));

// Users HTTP Methods
// This one list all of the existing users
app.get("/users", async (req, res) => {
    const users = await db.query(`SELECT * FROM users`);
    res.json(users.rows);
});

// This creates a new user
app.post("/users", async (req, res) => {
    try {
        const newUser = await db.query(`INSERT INTO users (username) VALUES ($1) RETURNING *`,
        [req.query.name]);
        res.json(newUser.rows);
    } catch (err) {
        console.log(err);
        res.json({ error: "It was not possible to create a new user" });
    }
});

// This deletes an existing user
app.delete("/users/:id", async (req, res) => {
    const selectedId = parseInt(req.params.id);

    try {
        await db.query(`DELETE FROM users Where id=$1`,
        [selectedId]);
        res.json({ message: `User with id ${selectedId} deleted successfully!` });
    } catch (err) {
        console.log(err);
        res.json({ error: "Unsuccessul action! The user was not found." })
    }
});

// books

app.listen(port, () => {
    console.log(`Server running successfully on port ${port}`);
});
