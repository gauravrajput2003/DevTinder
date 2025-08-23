const jwt = require("jsonwebtoken");
const User = require("../models/user");

// The function MUST have `next` as the third parameter.
const userAuth = async (req, res, next) => {
    try {
        console.log("=== AUTH MIDDLEWARE ===");
        console.log("Cookies:", req.cookies);
        
        const token = req.cookies.token;
        if (!token) {
            console.log("No token found");
            return res.status(401).send("Authentication failed: No token provided.");
        }

        console.log("Token found, verifying...");
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRETE); // Use your actual secret key

        // Find the user from the token's ID
        const user = await User.findById(decoded._id).select('-password');

        if (!user) {
            console.log("User not found for ID:", decoded._id);
            return res.status(404).send("Authentication failed: User not found.");
        }

        console.log("Auth successful for user:", user._id);
        // Attach the user object to the request so other routes can use it
        req.user = user;
        
        // CRITICAL: Call next() to continue to the route handler in requests.js
        next();

    } catch (error) {
        console.log("Auth error:", error.message);
        res.status(401).send("Authentication failed: Invalid token.");
    }
};

module.exports = { userAuth };