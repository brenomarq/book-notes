import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
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
app.use(express.json());

async function checkBook(title) {
    const books = await axios.get(`${LOCAL_URL}/books`);
    const book = books.data.find((book) => book.title.toLowerCase() === title.toLowerCase());
    return book;
}

let currentUserId = 0; // 0 is default before entering the data

app.get("/", async (req, res) => {
    const users = await axios.get(`${LOCAL_URL}/users`);
    res.render("index.ejs", { users: users.data });
});

app.get("/home", async (req, res) => {
    try {
        const books = await axios.get(`${LOCAL_URL}/reviews/${currentUserId}`);
        res.render("home.ejs", { books: books.data });
    } catch (err) {
        console.log(err);
    }
});

app.post("/home", async (req, res) => {
    const userId = parseInt(req.body.user);

    try {
        const books = await axios.get(`${LOCAL_URL}/reviews/${userId}`);
        currentUserId = userId;
        res.render("home.ejs", { books: books.data });
    } catch (err) {
        console.log(err);
    }
});

app.post("/new", async (req, res) => {
    switch (req.body.new) {
        case "user":
            res.render("new.ejs", { user: "user" });
            break;

        case "book":
            res.render("new.ejs", { book: "book" });
            break;

        default:
            break;
    }
});

app.post("/createUser", async (req, res) => {
    try {
        await axios.post(`${LOCAL_URL}/users`, req.body);
        res.redirect("/home");
    } catch (err) {
        console.log(err);
    }
});

app.post("/createBook", async (req, res) => {
    let bookId = 0;

    try {
        // Check if the book already exists on the database
        if (await checkBook(req.body.title)) {
            const books = await axios.get(`${LOCAL_URL}/books`);
            const book = books.data.find((book) => book.title.toLowerCase() === req.body.title.toLowerCase());
            bookId = book.id;

            await axios.post(`${LOCAL_URL}/reviews`, {
                book_id: bookId,
                user_id: currentUserId,
                score: req.body.score,
                finish_date: req.body.finish,
                text_content: req.body.opinion,
            });
            res.redirect("/home");

        } else {
            const newBook = await axios.post(`${LOCAL_URL}/books`, {
                title: req.body.title,
                author: req.body.author,
            });
            bookId = parseInt(newBook.data[0].id);

            await axios.post(`${LOCAL_URL}/reviews`, {
                book_id: bookId,
                user_id: currentUserId,
                score: req.body.score,
                finish_date: req.body.finish,
                text_content: req.body.opinion,
            });

            res.redirect("/home");
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/options", async (req, res) => {
    // Checks the option selected by the user (Edit or Delete)
    if (req.body.edit) {

        try {
        const bookId = parseInt(req.body.edit);

        const reviews = await axios.get(`${LOCAL_URL}/reviews/${currentUserId}`);
        const selectedReview = reviews.data.find((review) => review.book_id === bookId);

        res.render("options.ejs", {
            edit: selectedReview,
            userId: currentUserId,
         });
        } catch (err) {
            console.log(err);
        }
    } else {
        const delIds = {
            book: parseInt(req.body.delete),
            user: currentUserId,
        };

        res.render("options.ejs", { del: delIds });
    }
});

app.post("/edit", async (req, res) => {
    try {
        await axios.put(`${LOCAL_URL}/reviews`, req.body);
        res.redirect("/home");
    } catch (err) {
        console.log(err);
    }
});

app.post("/delete", async (req, res) => {
    try {
        // Checks if the user really wants to delete the review
        switch (req.body.option) {
            case "del":
                await axios.delete(`${LOCAL_URL}/reviews`, req.body);
                res.redirect("/home");
                break;

            case "cancel":
                res.redirect("/home");
                break;

            default:
                break;
        }

    } catch (err) {
        console.log(err);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
