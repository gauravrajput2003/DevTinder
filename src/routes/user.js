    const express=require('express');
    const { userAuth } = require('../middlewares/Auth');
    const connectionReqModel = require('../models/connnectionReq');
    const User=require("../models/user")
    const userRouter=express.Router();
    userRouter.get("/user/requests/received",userAuth,async(req,res)=>{
        try{
            const loggginedUser=req.user;
    const connectionRequest=await connectionReqModel.find({
        toUserId:loggginedUser._id,
        status:"interested"
    }).populate("fromUserId",["firstName","lastName","photoUrl","gender","age","about","skills"]);

    res.json({
        message:"data fetched successfully",
        data:connectionRequest
    });
    


        }
        catch(err){
            res.status(400).send(err.message);
        }
    });
    userRouter.get("/user/connections",userAuth,async(req,res)=>{
        try{
    const loggginedUser=req.user; 
    const connectionRequest=await connectionReqModel.find({
    $or: [ {toUserId:loggginedUser._id, status:"accepted"},
        {fromUserId:loggginedUser._id, status:"accepted"},],
    }).populate("fromUserId",["firstName","lastName","photoUrl","gender","age","about","skills"]).
    populate("toUserId",["firstName","lastName","photoUrl","gender","age","about","skills"]);
    const data=connectionRequest.map((row)=>{
        if(row.fromUserId._id.toString()===loggginedUser._id.toString()){
    return row.toUserId;
        }
    return row.fromUserId;
    });
    res.json({data});
        }
        catch(err){
            res.status(400).send({"error":err.message})
        }
    });
    userRouter.get("/feed", userAuth, async(req, res) => {
        try {
            const loggedInUser = req.user;
            const page=parseInt(req.query.page) || 1;
            let limit=parseInt(req.query.limit) || 10;
            limit=limit>50?50:limit;
            const skip=(page-1)*limit;
            // Find all connection requests (sent + received)
            const connectionRequest = await connectionReqModel.find({
                $or: [
                    { fromUserId: loggedInUser._id }, 
                    { toUserId: loggedInUser._id }
                ],
            })
            .select("fromUserId toUserId"); // Don't populate here, just get the IDs
            
            const hideUserFromFeed = new Set();
            
            connectionRequest.forEach(req => {
                // Fix: Access _id property first, then convert to string
                hideUserFromFeed.add(req.fromUserId._id.toString());
                hideUserFromFeed.add(req.toUserId._id.toString());
            });
            
            const users = await User.find({
                $and: [ 
                    { _id: { $nin: Array.from(hideUserFromFeed) } },
                    { _id: { $ne: loggedInUser._id } },
                ],
            }).skip(skip).limit(limit);
            
            res.json({
                message: "Feed fetched successfully",
                data: users
            });
            
        } catch(err) {
            res.status(400).json({ "error": err.message });
        }
    });

    module.exports=userRouter;