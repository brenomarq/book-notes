import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { password } from "./secret.js";

// Initialize express application
const app = express();
const port = 3000;
const LOCAL_URL = "http://localhost:4000"

// Connect to the database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book_notes",
    password: password,
    port: 5432,
})
db.connect();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 0; // 0 is default before entering the data

async function getData(id) {
    const result = await db.query(`
    SELECT title, author, cover, score, finish_date, text_content, username
    FROM reviews
    JOIN users ON user_id = users.id
    JOIN books ON book_id = books.id
    WHERE user_id=$1`, [id]);
    return result.rows;
}

async function getUsers() {
    const result = await db.query(`SELECT * FROM users`);
    return result.rows;
}

async function getBooks() {
    const result = await db.query(`SELECT * FROM books`);
    return result.rows;
}

app.get("/", async (req, res) => {
    const users = await getUsers();
    res.render("index.ejs", { users: users });
});

app.post("/home", async (req, res) => {
    const selectedId = parseInt(req.body.user);

    try {
        const data = await getData(selectedId);
        currentUserId = selectedId;
        res.render("home.ejs", { books: data });
    } catch (err) {
        console.log(err.message);
        res.redirect("/");
    }
});

app.post("/selectBook", async (req, res) => {
    const book = req.body.book;

    if (book === "new") {
        res.render("new.ejs");
    } else {

    }
});

app.post("/addBook", (req, res) => {
    const data = req.body;
    console.log(data);
});

app.listen(port, () => {
    console.log(`Server running on port 3000.`)
});
