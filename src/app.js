console.log("starting project");

const express = require("express");
const app = express();
app.get("/user", (req, res) => {
    res.send({"name":"gauarv","last":"singh"});
});
app.delete("/user", (req, res) => {
    res.send("databse deleted successfully");
});
app.use("/test", (req, res) => {
    res.send("hello from abes test");
});
// app.use("/bihar", (req, res) => {
//     res.send("hello from abes bihar");
// });
// app.use("/test", (req, res) => {
//     res.send("hello from abes test");
// });


app.use("/", (req, res) => {
    res.send("hello from abes");
});

// Start the server
app.listen(9931, () => {
    console.log("server running on 9931...");
});