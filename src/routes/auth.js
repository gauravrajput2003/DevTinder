const express=require("express");
const authRouter=express.Router();

const {validateSignup}=require("../utils/validation");
const User = require("../models/user");
const {userAuth}=require("../middlewares/Auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isProd = process.env.NODE_ENV === 'production';

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
      
     const saveduser=await newUser.save();
     const token =await saveduser.getJWT(); 
            res.cookie("token", token,{
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                domain: isProd ? 'codeally.online' : undefined,
                path: '/',
                expires: new Date(Date.now()+8*3600000),
            });  
           
     res.json({message:"data send successfully",data:saveduser});}
     catch(err){
res.status(400).send(err.message);
     }
});

const loginHandler = async(req, res) => {
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
                        const token =await user.getJWT();
                        res.cookie("token", token, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'None',
                            domain: isProd ? 'codeally.online' : undefined,
                            path: '/',
                            maxAge: 8*3600000
                        });  
            return res.send({
               user
            });
        } else {
            throw new Error("invalid credential");
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.status(400).send("ERROR: " + err.message);
    }
};

// Support both /Login and /login paths
authRouter.post("/Login", loginHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/logout",async(req,res)=>{
    res.cookie("token", null, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        domain: isProd ? 'codeally.online' : undefined,
        path: '/',
        expires: new Date(Date.now()),
    });
    res.send("logout successful!");
});
module.exports=authRouter;