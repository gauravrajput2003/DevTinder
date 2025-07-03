const express=require("express");
const ProfileRouter=express.Router();
const User = require("../models/user");
const {userAuth}=require("../middlewares/Auth");

ProfileRouter.get("/profile", userAuth, async(req, res) => {
    try {
        // If your middleware sets req.user, you can use it here
        res.send(req.user);
    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});

// Fix: Export the router object, not calling it as a function
module.exports=ProfileRouter;