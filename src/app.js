const express = require("express");
const http = require('http'); // Add this for Socket.io
const socketIo = require('socket.io'); // Add this for Socket.io
const connDB = require("./config/database"); 
const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.io
const bcrypt=require("bcrypt");
const cors=require("cors");
const jwt=require("jsonwebtoken");

// Socket.io setup with CORS - Add this before your existing middleware
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174","http://localhost:5175","http://localhost:5176","http://localhost:5177", "http://51.21.131.83"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

//Add body parser middleware (your existing code)
app.use(cors({
    origin:["http://localhost:5173", "http://localhost:5174","http://localhost:5175","http://localhost:5176","http://localhost:5177", "http://51.21.131.83"],
    credentials:true,
}));
app.use(express.json());
const cookieParser=require("cookie-parser");
app.use(cookieParser());     //middleware    

//routers (your existing code)
const authRouter=require("./routes/auth");
const profileRouter=require("./routes/profile");
const requestRouter=require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);

// Socket.io logic - Add this section
const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    userSocketMap[userId] = socket.id;
    socket.join(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Handle sending messages
  socket.on('sendMessage', (data) => {
    const { senderId, receiverId, message, senderName } = data;
    const receiverSocketId = userSocketMap[receiverId];
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        senderName,
        message,
        timestamp: new Date()
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = userSocketMap[receiverId];
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', {
        senderId,
        isTyping: true
      });
    }
  });

  socket.on('stopTyping', (data) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = userSocketMap[receiverId];
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', {
        senderId,
        isTyping: false
      });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from mapping
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Your existing API routes (unchanged)
app.get("/user", async(req, res) => {
    const useremail =  req.body.email;
    try {
        // Add await here, as User.find returns a Promise
        const users = await User.find({email: useremail});
             
        // Now we can safely check the length
        if(users.length === 0) {
            res.status(404).send("user not found");
        }
        else {     
            res.send(users);  
        }
    }
    catch(err) {
        res.status(500).send("something went wrong"); // Changed to 500 for server errors
    }
});

//feed api
app.get("/feed",(req,res)=>{

});

//delete user api
app.delete("/user", async(req, res) => {
    const userid = req.body.userid;
    try{
        const result = await User.findOneAndDelete({_id: userid});
        if (result) {
            res.send("User deleted successfully");
        } else {
            res.status(404).send("User not found");
        }
    }
    catch(err){
        res.status(500).send("something went wrong");
    }
});

//update user api
app.patch("/user", async(req, res) => {
    const userid = req.body.userid;
    // Remove userid from data to avoid trying to update the _id field
    const { userid: id, ...data } = req.body;
   
    try {
         const allowed_update=["userid","photoUrl","about","skills","gender","age"];
         const isupdate=Object.keys(data).every((k)=>allowed_update.includes(k));
         if(!isupdate){
            throw new Error("update not akkowed");   
         }
         if(data?.skills.length>10){
            throw new Error("skills cannot more than 10");
         }
         
        const user = await User.findByIdAndUpdate(
            userid,  // Just use the ID directly, not an object
            data,
            {
                new: true,  // 'new: true' is preferred over returnDocument:'after'
                runValidators: true
            }
        );
        
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        console.log(user);
        res.send("user updated successfully");
    }
    catch(err) {
        res.status(400).send(err.message);  // Fixed to send only the message
    }
});

//send connnection request api

// Database connection and server start (CHANGE app.listen to server.listen)
connDB()
.then(() => {
    console.log("database connect successfull");
    server.listen(9931,'0.0.0.0',  () => { // Changed from app.listen to server.listen
        console.log("server running on 9931...");
    });  
})
.catch((err) => {
    console.log("databse cannot be connected");
})