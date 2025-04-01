console.log("starting project");

const express = require("express");
const app = express();

// Define a route for "/test"
app.get("/test", (req, res) => {
    res.send("hello from abes test");
});
app.get("/bihar", (req, res) => {
    res.send("hello from abes bihar");
});
app.get("/test", (req, res) => {
    res.send("hello from abes test");
});

// Define a fallback route for all other requests
app.get("/", (req, res) => {
    res.send("hello from abes");
});

// Start the server
app.listen(9931, () => {
    console.log("server running on 9931...");
});