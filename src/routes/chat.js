const express=require("express");
const { userAuth } = require("../middlewares/Auth");
const { chat } = require("../models/chat");
const connectionReqModel = require("../models/connnectionReq");
const chatRouter=express.Router();

chatRouter.get("/:targetUserId",userAuth,async(req,res)=>{
    const {targetUserId}=req.params;
    const userId=req.user._id;
    try{
        // Check if users are friends (connection accepted)
        const connection = await connectionReqModel.findOne({
            $or: [
                {fromUserId: userId, toUserId: targetUserId, status: "accepted"},
                {fromUserId: targetUserId, toUserId: userId, status: "accepted"}
            ]
        });
        
        if(!connection){
            return res.status(403).json({error: "You can only chat with accepted connections"});
        }

        let chatDoc=await chat.findOne({
            participants:{$all:[userId,targetUserId]},
        }).populate({
           path:"messages.senderId",
           select:"firstName lastName"
        }).populate({
           path:"participants",
           select:"firstName lastName"
        });
        if(!chatDoc){
            chatDoc= new chat({
                participants:[userId,targetUserId],
                messages:[],
            });
            await chatDoc.save();
            // Populate after saving
            chatDoc = await chat.findById(chatDoc._id)
                .populate({
                   path:"messages.senderId",
                   select:"firstName lastName"
                }).populate({
                   path:"participants", 
                   select:"firstName lastName"
                });
        }
        res.json(chatDoc);
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error: err.message});
    }
});

chatRouter.post("/:targetUserId",userAuth,async(req,res)=>{
    const {targetUserId}=req.params;
    const userId=req.user._id;
    try{
        // Check if users are friends (connection accepted)
        const connection = await connectionReqModel.findOne({
            $or: [
                {fromUserId: userId, toUserId: targetUserId, status: "accepted"},
                {fromUserId: targetUserId, toUserId: userId, status: "accepted"}
            ]
        });
        
        if(!connection){
            return res.status(403).json({error: "You can only chat with accepted connections"});
        }

        let chatDoc=await chat.findOne({
            participants:{$all:[userId,targetUserId]},
        }).populate({
           path:"messages.senderId",
           select:"firstName lastName"
        }).populate({
           path:"participants",
           select:"firstName lastName"
        });
        if(!chatDoc){
            chatDoc= new chat({
                participants:[userId,targetUserId],
                messages:[],
            });
            await chatDoc.save();
            // Populate after saving
            chatDoc = await chat.findById(chatDoc._id)
                .populate({
                   path:"messages.senderId",
                   select:"firstName lastName"
                }).populate({
                   path:"participants", 
                   select:"firstName lastName"
                });
        }
res.json(chatDoc);
    }
    catch(err){
        console.log(err.message);
    }
});
module.exports=chatRouter;