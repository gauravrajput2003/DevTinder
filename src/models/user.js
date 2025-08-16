const mongoose = require("mongoose");
const validator=require("validator" );
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");    
const UserSchema = mongoose.Schema({
    firstName:{
    type:String,
    required:true,
    minLength:4,
    maxLength:50,
    },
    lastName:{
    type:String, 
  
    },
    email:{
    type:String,
    lowercase:true,
    required:true,
    unique:true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error("email is invalid");
        }
    }
    },
    password:{
    type:String,
      validate(value){
        if(!validator.isStrongPassword(value)){
            throw new Error("Enter a Strong Password");
        }
    }
   
    },
   
    age:{
    type:Number,
    min:18,
    },
    phone:{
type:String,
  validate(value){
        if(!validator.isMobilePhone(value)){
            throw new Error("phone is  invalid");
        }
    }
    },
   
    gender:{
    type:String,
    enum:{
        values:["male","female","other"],
        message:`{VALUE} is not valid gender type`
    },
    // validate(value){
    //     if(!["male","female","other"].includes(value)){
    //         throw new Error("gender data is not valid");
    //     }   
    // },
    },
    photoUrl:{
        type:String,
        default:"https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fwww.gravatar.com%2Favatar%2F2c7d99fe281ecd3bcd65ab915bac6dd5%3Fs%3D250",
          validate(value){
        if(!validator.isURL(value)){
            throw new Error("url  is invalid");
        }
    }
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
);
UserSchema.index({firstName:1,lastName:1});
UserSchema.index
/* The `UserSchema.methods.getJWT` function is a method defined on the UserSchema model in Mongoose.
This method is used to generate a JSON Web Token (JWT) for a user instance. */
UserSchema.methods.getJWT=async function () {
    const user=this;
    const token=await jwt.sign({_id:user._id},process.env.JWT_SECRETE,{
        expiresIn:"7d",
    });
    return token;
}
UserSchema.methods.validatePassword=async function(passwordByuser){
    const user=this;
    const passwordHash=user.password;
    const isValidpassword=await bcrypt.compare(passwordByuser,passwordHash);
    return isValidpassword; 
}
module.exports = mongoose.model("user", UserSchema);