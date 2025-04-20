const mongoose = require("mongoose");

const connDB = async () => {
    // try {
        await mongoose.connect(
            "mongodb+srv://project01:Animal%40%408000@project01.zfjbz.mongodb.net/devTinder?retryWrites=true&w=majority&appName=project01"
        );
    //     console.log("Database connected successfully");
    // } catch (err) {
    //     console.error("Database connection failed:", err);
    //     throw err; 
    // }
};

module.exports = connDB;