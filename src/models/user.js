const mongoose = require("mongoose");

const UserScheme = mongoose.Schema({
    firstName:{
    type:String
    },
    lastName:{
    type:String
    },
    email:{
    type:String
    },
    password:{
    type:String
    },
    age:{
    type:Number
    },
    gender:{
    type:String
    },
})
module.exports = mongoose.model("user", UserScheme);