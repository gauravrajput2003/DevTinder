const socket=require("socket.io");
const crypto=require("crypto");
const { chat } = require("../models/chat");
const connectionReqModel = require("../models/connnectionReq");
const getSecretRoomId=(userId,targetuserId)=>{
return crypto.createHash("sha256").update([userId,targetuserId].sort().join("_")).digest("hex");
}
const initalizesocet=(server)=>{

    const io=socket(server,{
      path: '/socket.io/',
      cors:{
         origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://51.21.131.83",
        "https://codeally.online",
        "https://www.codeally.online",
      ],
      credentials: true,
      methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true, // Support older socket.io versions if needed
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    
    // Store online users
    const onlineUsers = new Map();
    
    io.on("connection",(socket)=>{
      console.log("User connected:", socket.id);
      
      // Handle user coming online
      socket.on("userOnline", (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} is now online`);
        
        // Broadcast to all connected clients that this user is online
        socket.broadcast.emit("userStatusUpdate", {
          userId: userId,
          status: "online"
        });
      });
      
      //handle event
      socket.on("joinChat",({userId,targetuserId})=>{
        const roomId=getSecretRoomId(userId,targetuserId);
        console.log("Joining room:-"+roomId);
        socket.join(roomId);
        
        // Send online status of target user to the joining user
        const isTargetOnline = onlineUsers.has(targetuserId);
        socket.emit("targetUserStatus", {
          userId: targetuserId,
          status: isTargetOnline ? "online" : "offline"
        });
      });
      
      socket.on("sendMessage",async ({
         firstName,
         lastName,
          userId,
          targetuserId,
          text
        })=>{
        console.log("Message received:", {firstName, lastName,text});
       const roomId=getSecretRoomId(userId,targetuserId);
       
       try{
        // Check if users are friends (connection accepted)
        const connection = await connectionReqModel.findOne({
            $or: [
                {fromUserId: userId, toUserId: targetuserId, status: "accepted"},
                {fromUserId: targetuserId, toUserId: userId, status: "accepted"}
            ]
        });
        
        if(!connection){
            socket.emit("error", {message: "You can only send messages to accepted connections"});
            return;
        }

        //save message to database
        let chatDoc=await chat.findOne({
            participants:{$all:[userId,targetuserId]},
        });
        if(!chatDoc){
            chatDoc =new chat({
                participants:[userId,targetuserId],
                messages:[],
            });
        }
        chatDoc.messages.push({
            senderId:userId,
            text,
        });
        await chatDoc.save();
        io.to(roomId).emit("messageReceived",{firstName,text,lastName});
       }
       catch(err){
        console.log(err.message);
       }
      });
      
      // Handle typing events
      socket.on("typing", ({userId, targetuserId, isTyping}) => {
        const roomId = getSecretRoomId(userId, targetuserId);
        socket.to(roomId).emit("userTyping", {userId, isTyping});
      });
    
      
      socket.on("disconnect",()=>{
        console.log("User disconnected:", socket.id);
        
        // Handle user going offline
        if(socket.userId) {
          onlineUsers.delete(socket.userId);
          console.log(`User ${socket.userId} went offline`);
          
          // Broadcast to all connected clients that this user is offline
          socket.broadcast.emit("userStatusUpdate", {
            userId: socket.userId,
            status: "offline"
          });
        }
      });
    });
 
};
module.exports=initalizesocet;