const express = require("express");
const connDB = require("./config/database"); // 
const app = express();

(async () => {
    try {
        await connDB(); 
    } catch (err) {
        console.error("Failed to connect to the database. Exiting...");
        process.exit(1); 
    }
})();

app.get("/admin/deleteUser", (req, res) => {
    res.send("Deleted a user");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong");
});

app.listen(9931, () => {
    console.log("server running on 9931...");
});  