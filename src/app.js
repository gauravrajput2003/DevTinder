
const express = require("express");
const app = express();
// app.get("/user", (req, res) => {
//     res.send({"name":"gauarv","last":"singh"});
// });
// app.delete("/user", (req, res) => {
//     res.send("databse deleted successfully");
// });
// app.use("/test", (req, res) => {
//     res.send("hello from abes test");
// });
// app.post("/profile",(req,res)=>{
// res.send("profile updated success");
// })
// app.use("/bihar", (req, res) => {
//     res.send("hello from abes bihar");
// });
// app.use("/test", (req, res) => {
//     res.send("hello from abes test");
// });
// app.use("/", (req, res,next) => {
//     res.send("hello from abes");
//     next();
// });
// app.get("/user",
//      (req, res,next) => {
//     res.send({"Router 1st is calling over here"});
//     next();
// },
//      (req, res,next) => {
//     res.send({"Router 2nd is calling over here "});next();
// },
// );           
//handle auth middleware for only get requests get,post
const {adminAuth}=require("./middlewares/Auth");
app.use("/admin",adminAuth);
app.get("/admin/getAlloc",(req,res)=>{

    res.send("all data send");
})
app.get("/admin/deleteUser",(req,res)=>{
    res.send("Deleted a user");
})
// Start the server
app.listen(9931, () => {
    console.log("server running on 9931...");
});