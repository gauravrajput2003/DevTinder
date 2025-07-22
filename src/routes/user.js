const express=require('express');
const { userAuth } = require('../middlewares/Auth');
const connectionReqModel = require('../models/connnectionReq');
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
})

module.exports=userRouter;