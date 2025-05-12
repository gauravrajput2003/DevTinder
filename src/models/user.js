const mongoose = require("mongoose");

const UserScheme = mongoose.Schema({
    firstName:{
    type:String,
    required:true,
    },
    lastName:{
    type:String,
  
    },
    email:{
    type:String,
    lowercase:true,
    required:true,
    unique:true
    },
    password:{
    type:String,
   
    },
   
    age:{
    type:Number,
    min:18,
    },
   
    gender:{
    type:String,
    validate(value){
        if(!["male","female","other"].includes(value)){
            throw new Error("gender data is not valid");
        }   
    },
    },
    photoUrl:{
        type:String,
        default:"https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fwww.gravatar.com%2Favatar%2F2c7d99fe281ecd3bcd65ab915bac6dd5%3Fs%3D250",
    },
    about:{
        type:String,
        default:"this is default about users "
    },
    skills:{
        type:[String],

    },
  
  
},
{
    timestamps:true,
}
)
module.exports = mongoose.model("user", UserScheme);