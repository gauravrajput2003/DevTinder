const express = require("express");
const connDB = require("./config/database"); 
const app = express();
const bcrypt=require("bcrypt");
const cors=require("cors");
const jwt=require("jsonwebtoken");

// Socket.io removed

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
// NOTE: Express 5 with path-to-regexp v6 no longer accepts '*' path patterns.
// The CORS middleware will handle preflight without an explicit app.options line.
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
// app.use("/", authRouter);
// app.use("/", profileRouter);
// app.use("/", requestRouter);
// app.use("/", userRouter);

// Health check for debugging
app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }));

// Root OK endpoint
app.get('/', (_req, res) => res.status(200).send('OK'));
app.get('/api', (_req, res) => res.status(200).send('API OK'));

// Generic preflight handled by CORS middleware

// Socket.io event handling removed

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

// Database connection and server start
connDB()
.then(() => {
    console.log("database connect successfull");
  const PORT = 9931;
  app.listen(PORT,'0.0.0.0',  () => {
    console.log(`server running on ${PORT}...`);
  });  
})
.catch((err) => {
    console.log("databse cannot be connected");
})