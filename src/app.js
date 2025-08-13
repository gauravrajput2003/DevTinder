const express = require("express");
const http = require('http'); // Add this for Socket.io
const socketIo = require('socket.io'); // Add this for Socket.io
const connDB = require("./config/database"); 
const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.io
const bcrypt=require("bcrypt");
const cors=require("cors");
const jwt=require("jsonwebtoken");

// Socket.io setup with CORS - include production domain(s)
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://51.21.131.83",
      "https://codeally.online",
      "https://www.codeally.online"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Trust proxy (needed when running behind Nginx/Ingress for proper HTTPS and cookies)
app.set('trust proxy', 1);

// CORS - include production domain(s) and methods; enable credentials
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://51.21.131.83",
    "https://codeally.online",
    "https://www.codeally.online"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));
// Handle preflight
app.options('*', cors(corsOptions));
app.use(express.json());
const cookieParser=require("cookie-parser");
app.use(cookieParser());     //middleware    

// Minimal request logger (useful on server to verify methods/paths)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

//routers (your existing code)
const authRouter=require("./routes/auth");
const profileRouter=require("./routes/profile");
const requestRouter=require("./routes/requests");
const userRouter = require("./routes/user");

// Mount routes under /api for deployed clients using /api prefix
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);

// Backward compatibility (optional): keep root mounts if some clients still call without /api
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// Health check for debugging
app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }));

// Root OK endpoint
app.get('/', (_req, res) => res.status(200).send('OK'));
app.get('/api', (_req, res) => res.status(200).send('API OK'));

// Generic preflight for /api
app.options('/api/*', cors(corsOptions));

// Socket.io logic - Add this section
const userSocketMap = {};
const onlineUsers = new Set(); // Track online users

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    userSocketMap[userId] = socket.id;
    socket.join(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Handle user coming online
  socket.on('userConnected', (data) => {
    const { userId } = data;
    onlineUsers.add(userId);
    userSocketMap[userId] = socket.id;
    
    // Notify all users about this user being online
    socket.broadcast.emit('userOnline', { userId });
    
    // Send current online users list to the newly connected user
    socket.emit('onlineUsers', Array.from(onlineUsers));
    
    console.log(`User ${userId} is now online`);
  });

  // Handle user going offline
  socket.on('userDisconnected', (data) => {
    const { userId } = data;
    onlineUsers.delete(userId);
    delete userSocketMap[userId];
    
    // Notify all users about this user going offline
    socket.broadcast.emit('userOffline', { userId });
    
    console.log(`User ${userId} is now offline`);
  });

  // Handle sending messages
  socket.on('sendMessage', (data) => {
    const { senderId, receiverId, message, senderName, messageType, audioData } = data;
    const receiverSocketId = userSocketMap[receiverId];
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        senderName,
        message,
        messageType: messageType || 'text',
        audioData: audioData || null,
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
    // Remove user from mapping and online users
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        onlineUsers.delete(userId);
        delete userSocketMap[userId];
        
        // Notify all users about this user going offline
        socket.broadcast.emit('userOffline', { userId });
        console.log(`User ${userId} disconnected and is now offline`);
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