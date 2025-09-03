const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username, password)=>{ //returns boolean
    return users.filter((user) => {
        return (user.username === username && user.password === password);
    });
}

const authenticatedUser = (username, password) => {
    let validusers = isValid(username, password);
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) return res.status(403).json({ message: "Please login to submit a review" });
    if (!isbn || !books[isbn]) return res.status(404).json({ message: "Invalid ISBN" });

    const review = req.query.review;
    if (!review) return res.status(400).json({ message: "Review query parameter is required" });

    if (!books[isbn].reviews) books[isbn].reviews = {};
    books[isbn].reviews[username] = review;

    return res.status(200).json({ 
        message: `Review by ${username} added/updated successfully`, 
        reviews: books[isbn].reviews 
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) return res.status(403).json({ message: "Please login to delete a review" });
    if (!isbn || !books[isbn]) return res.status(404).json({ message: "Invalid ISBN" });
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user to delete" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ 
        message: `Review by ${username} deleted successfully`, 
        reviews: books[isbn].reviews 
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;