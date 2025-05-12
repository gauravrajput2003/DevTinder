const express = require("express");
const connDB = require("./config/database"); 
const User = require("./models/user"); // Import once with capital U
const app = express();

// Add body parser middleware
app.use(express.json());

/* The code snippet `app.post("/signup", async(req, res) => { const newUser = new User(req.body);
console.log(req);` is defining a route in the Express application for handling POST requests to the
"/signup" endpoint. */
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
//get email id 
app.get("/user", async(req, res) => {
    const useremail = req.body.email;
    try {
        // Add await here, as User.find returns a Promise
        const users = await User.find({email: useremail});
        
        // Now we can safely check the length
        if(users.length === 0) {
            res.status(404).send("user not found");
        }
        else {
            res.send(users);
        }
    }
    catch(err) {
        res.status(500).send("something went wrong"); // Changed to 500 for server errors
    }
})
//feed 
app.get("/feed",(req,res)=>{

})
//delete user api
app.delete("/user", async(req, res) => {
    const userid = req.body.userid;
    try{
        const result = await User.findOneAndDelete({_id: userid});
        if (result) {
            res.send("User deleted successfully");
        } else {
            res.status(404).send("User not found");
        }
    }
    catch(err){
        res.status(500).send("something went wrong");
    }
});
//update user
 app.patch("/user", async(req, res) => {
    const userid = req.body.userid;
    // Remove userid from data to avoid trying to update the _id field
    const { userid: id, ...data } = req.body;
   
     
    try {

         const allowed_update=["userid","      photoUrl","about","skills","gender","age"];
         const isupdate=Object.keys(data).every((k)=>allowed_update.includes(k));
         if(!isupdate){
            throw new Error("update not akkowed");   
         }
         if(data?.skills.length>10){
            throw new Error("skills cannot more than 10");
         }
         
        const user = await User.findByIdAndUpdate(
            userid,  // Just use the ID directly, not an object
            data,
            {
                new: true,  // 'new: true' is preferred over returnDocument:'after'
                runValidators: true
            }
        );
        
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        console.log(user);
        res.send("user updated successfully");
    }
    catch(err) {
        res.status(400).send(err.message);  // Fixed to send only the message
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

