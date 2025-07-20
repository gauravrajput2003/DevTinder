const jwt = require("jsonwebtoken");
const User = require("../models/user");

// The function MUST have `next` as the third parameter.
const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Authentication failed: No token provided.");
        }

        // Verify the token
        const decoded = jwt.verify(token, "Animal@@80"); // Use your actual secret key

        // Find the user from the token's ID
        const user = await User.findById(decoded._id).select('-password');

        if (!user) {
            return res.status(404).send("Authentication failed: User not found.");
        }

        // Attach the user object to the request so other routes can use it
        req.user = user;
        
        // CRITICAL: Call next() to continue to the route handler in requests.js
        next();

    } catch (error) {
        res.status(401).send("Authentication failed: Invalid token.");
    }
};

module.exports = { userAuth };