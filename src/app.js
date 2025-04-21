const express = require("express");
const connDB = require("./config/database"); 
const User = require("./models/user"); // Import once with capital U
const app = express();

// Add body parser middleware
app.use(express.json());

app.post("/signup", async(req, res) => {
     const newUser = new User(req.body);
     console.log(req);
        // firstName: "sikhar",
        // lastName: "dhawan",
        // email: "sikhar@2003",
        // password: "hanji"
     
     try{
     await newUser.save();
     res.send("data send successfully");}
     catch(err){
res.status(400).send(err.message);
     }
})

connDB()
.then(() => {
    console.log("database connect successfull");
    app.listen(9931, () => {
        console.log("server running on 9931...");
    });  
})
.catch((err) => {
    console.log("databse cannot be connected");
})

