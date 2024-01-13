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

let currentUserId = 0; // 0 is default before entering the data

app.get("/", async (req, res) => {
    const users = await axios.get(`${LOCAL_URL}/users`);
    res.render("index.ejs", { users: users.data });
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
            console.log(1);
            break;

        case "book":
            console.log(2);
            break;

        case "review":
            console.log(3);
            break;

        default:
            console.log("What???")
            break;
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
