const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/Auth");
const user = require("../models/user");
const connectionreq=require("../models/connnectionReq");
const connectionReq = require("../models/connnectionReq");
const sendEmail=require("../utils/sendEmail");

requestRouter.post("/request/send/:status/:toUserid", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserid.trim();
        const status = req.params.status;

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
        const connectionRequest = new connectionReq({
            fromUserId,
            toUserId,
            status,
        });
        const data = await connectionRequest.save();
        
        // Send email notification to the actual recipient (toUser)
        try {
            const emailRes = await sendEmail.run(
                toUser.emailId,        // Send to the recipient's email (Sona's email)
                toUser.firstName,      // Recipient's name (Sona)
                req.user.firstName     // Sender's name (Piyush)
            );
            console.log(`Email sent to ${toUser.firstName} (${toUser.emailId}) about connection request from ${req.user.firstName}`);
            console.log("Email response:", emailRes);
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
            // Don't fail the entire request if email fails
        }
        
        console.log("Connection request saved successfully:", data._id);
        
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
requestRouter.post("/request/review/:status/:requestId", userAuth, async(req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        console.log("Looking for request with:");
        console.log("requestId:", requestId);
        console.log("toUserId:", loggedInUser._id);
        console.log("status: interested");
        
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "status not allowed" });
        }

        const anyRequest = await connectionReq.findById(requestId);
        console.log("Request exists:", anyRequest);

        const connectionRequest = await connectionReq.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });
        
        if (!connectionRequest) {
            return res.status(404).json({ 
                message: "connection request not found",
                debug: {
                    requestId,
                    loggedInUserId: loggedInUser._id,
                    requestExists: !!anyRequest,
                    actualRequest: anyRequest
                }
            });
        }
        
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        
        res.json({ 
            message: `connection request ${status}`, 
            data 
        });
    } catch (err) {
        res.status(400).send("error: " + err.message);
    }
});

module.exports = requestRouter;