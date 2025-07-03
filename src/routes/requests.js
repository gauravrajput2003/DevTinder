const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/Auth");

// Add your request-related routes here
requestRouter.post("/request", userAuth, async(req, res) => {
    try {
        // Your code here
        res.send("Request sent");
    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});

module.exports = requestRouter;