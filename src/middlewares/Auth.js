 const jwt = require("jsonwebtoken");
const User = require("../models/user");



const userAuth = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).send("Token not found");
        }
        
        // Verify token
        const decoded = jwt.verify(token, "Animal@@80",);
        
        // Find user by id from token
        const user = await User.findById(decoded._id);
        
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        // Set user in request object for route handlers to use
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).send("Authentication failed");
    }
};

module.exports = { userAuth };