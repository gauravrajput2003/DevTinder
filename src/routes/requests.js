const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/Auth");
const user = require("../models/user");
const connectionreq=require("../models/connnectionReq");
const connectionReq = require("../models/connnectionReq");

// Add your request-related routes here
requestRouter.post("/request/send/:status/:toUserid", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserid.trim(); // Trim to prevent ID errors
        const status = req.params.status;

        // --- All checks must happen BEFORE you save ---

        // 1. Check if status is valid
        const allowed = ["ignore", "interested"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status type: " + status });
        }

        // 2. Find the user you are sending the request to
        const toUser = await user.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "The user you are trying to connect with does not exist." });
        }

        // 3. Check if a request already exists between these two users
        const existConnectiorReq = await connectionReq.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ],
        });
        if (existConnectiorReq) {
            return res.status(400).json({ message: "A connection request already exists with this user." });
        }

        // --- If all checks pass, create and save the new request ---
        const connectionRequest = new connectionReq({
            fromUserId,
            toUserId,
            status,
        });
        const data = await connectionRequest.save();

        // --- Finally, send ONE success response ---
        res.json({
            message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
            data,
        });

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).send("Invalid User ID format.");
        }
        res.status(400).send(err.message);
    }
});

module.exports = requestRouter;