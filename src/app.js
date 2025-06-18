const express = require("express");
const connDB = require("./config/database"); 
const User = require("./models/user"); // Import once with capital U
const {validateSignup}=require("./utils/validation");
const app = express();
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
//Add body parser middleware
app.use(express.json());
const cookieParser=require("cookie-parser");
app.use(cookieParser());     //middleware    
const {userAuth}=require("./middlewares/Auth");

//signup api
app.post("/signup", async(req, res) => {
    //validation of data
       try{ 
    validateSignup(req);
    const {firstName,lastName,email,password}=req.body;
     //enscrypt password   
const passwordHash=await bcrypt.hash(password,10);
     const newUser = new User({
        firstName,
        lastName,
        email,
        password:passwordHash,
     });
     console.log(req);
      
     await newUser.save();
     res.send("data send successfully");}
     catch(err){
res.status(400).send(err.message);
     }
});
//login api
app.post("/signin", async(req, res) => {
    try {
        // Check if email and password exist in request body
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).send("ERROR: Email and password are required");
        }
        
        const user = await User.findOne({email: email});
        if (!user) {
            throw new Error("email is not in DB");
        }
        
        const isPass = await bcrypt.compare(password, user.password);
        if (isPass) {
            //jwt tokens
            const token = jwt.sign({_id: user._id}, "Animal@@80"); // jwt.sign doesn't need await
            console.log(token); 
            //cookies
            res.cookie("token", token);  
            return res.send({
                message: "login successful", 
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            });
        } else {
            throw new Error("invalid credential");
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.status(400).send("ERROR: " + err.message);
    }
});
//profile api
app.get("/profile", userAuth, async(req, res) => {
    try {
        // Make sure req.user exists before using it
        if (!req.user) {
            return res.status(401).send("User authentication failed");
        }

        // Send the user data from the middleware
        res.send(req.user);
    } catch (err) {
        console.error("Profile error:", err);
        res.status(500).send("Server error: " + err.message);
    }
});
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
});
//feed api
app.get("/feed",(req,res)=>{

});
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
//update user api
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
});

//send connnection request api

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

