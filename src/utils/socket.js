const socket=require("socket.io");
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
      }
    });
    
    io.on("connection",(socket)=>{
      console.log("User connected:", socket.id);
      
      //handle event
      socket.on("joinChat",({userId,targetuserId})=>{
        const roomId=[userId,targetuserId].sort().join("_");
        console.log("Joining room:-"+roomId);
        socket.join(roomId);
      });
      
      socket.on("sendMessage",({
         firstName,
          userId,
          targetuserId,
          text
        })=>{
        console.log("Message received:", {firstName, text});
        const roomId=[userId,targetuserId].sort().join("_");
        io.to(roomId).emit("messageReceived",{firstName,text});
      });
      
      socket.on("disconnect",()=>{
        console.log("User disconnected:", socket.id);
      });
    });
 
};
module.exports=initalizesocet;