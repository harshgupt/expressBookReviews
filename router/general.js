const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

public_users.get('/', async (req, res) => {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://raw.githubusercontent.com/harshgupt/expressBookReviews/main/router/booksdb.js',
        }).then(() => ({ data: books }));

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const url = 'https://raw.githubusercontent.com/harshgupt/expressBookReviews/main/router/booksdb.js';

    axios.get(url)
        .then(response => {
            const books = eval(response.data);
            const book = books[isbn];

            if (book) {
                res.status(200).json(book);
            } else {
                res.status(404).json({ message: "Book not found" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching book details", error: error.message });
        });
});
  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const authorName = req.params.author;
    const url = 'https://raw.githubusercontent.com/harshgupt/expressBookReviews/main/router/booksdb.js';

    axios.get(url)
        .then(response => {
            const books = eval(response.data);
            const requestedBooks = Object.values(books).filter(book => book.author === authorName);

            if (requestedBooks.length > 0) {
                res.status(200).json(requestedBooks);
            } else {
                res.status(404).json({ message: "Requested author not found" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books by author", error: error.message });
        });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const titleName = req.params.title;
    const url = 'https://raw.githubusercontent.com/harshgupt/expressBookReviews/main/router/booksdb.js';

    axios.get(url)
        .then(response => {
            const books = eval(response.data);
            const requestedBooks = Object.values(books).filter(book => book.title === titleName);

            if (requestedBooks.length > 0) {
                res.status(200).json(requestedBooks);
            } else {
                res.status(404).json({ message: "Requested title not found" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books by title", error: error.message });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(isbn){
        res.send(books[isbn].reviews);
    } else {
        res.send("Please enter a valid ISBN");
    }
});

module.exports.general = public_users;