import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { password } from "./secret.js";

// Initialize express application
const app = express();
const port = 3000;

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

async function getData() {
    const result = await db.query(`
    SELECT title, author, cover, score, finish_date, text_content, username
    FROM reviews
    JOIN users ON user_id = users.id
    JOIN books ON book_id = books.id`)
    return result.rows;
}

app.get("/", async (req, res) => {
    const data = await getData();
    console.log(data);
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`Server running on port 3000.`)
});
