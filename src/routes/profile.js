const express=require("express");
const ProfileRouter=express.Router();
const User = require("../models/user");
const {userAuth}=require("../middlewares/Auth");
const {validateEditProfile}=require("../utils/validation")

ProfileRouter.get("/profile/view", userAuth, async(req, res) => {
    try {
        // If your middleware sets req.user, you can use it here
        res.send(req.user);
    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});
ProfileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfile(req)) {
            throw new Error("invalid edit request ");
        }
        const loggined = req.user;
        Object.keys(req.body).forEach((k) => loggined[k] = req.body[k]);
        await loggined.save();
        // Log updated user for debugging
        console.log("Profile updated:", loggined);
        res.json({ message: `${loggined.firstName}, profile updated successfully`, data: loggined });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(400).json({ message: err.message || "Profile update failed" });
    }
});

// Fix: Export the router object, not calling it as a function
module.exports=ProfileRouter;