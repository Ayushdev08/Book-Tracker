const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// PostgreSQL connection
const pool = new Pool({
    user: 'postgress1',
    host: 'localhost',
    database: 'Book_notes',
    password: 'ayush08',
    port: 5432,
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// Homepage - Display all books
app.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
        res.render('index', { books: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add a new book
app.post('/add', async (req, res) => {
    const { title, author, rating, notes } = req.body;
    try {
        await pool.query(
            'INSERT INTO books (title, author, rating, notes) VALUES ($1, $2, $3, $4)',
            [title, author, rating, notes]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Fetch book cover from Open Library API
app.get('/cover/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const response = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
        res.redirect(response.request.res.responseUrl);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching book cover');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});