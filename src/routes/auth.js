const express=require("express");
const authRouter=express.Router();

const {validateSignup}=require("../utils/validation");
const User = require("../models/user");
const {userAuth}=require("../middlewares/Auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
authRouter.post("/signup", async(req, res) => {
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

authRouter.post("/signin", async(req, res) => {
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
        
        const isPass = await user.validatePassword(password);
        if (isPass) {
            //jwt tokens
            const token =await user.getJWT(); // jwt.sign doesn't need await
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
module.exports=authRouter;