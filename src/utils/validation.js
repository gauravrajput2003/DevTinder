const validator=require("validator");
const validateSignup=(req)=>{
    const{firstName,lastName,email,password}=req.body;
    if(!firstName || !lastName){
        throw  new Error("name is not valid");
    }
    else if(firstName.length<4 || firstName.length>50){
        throw new Error("firstname should be 4-50");
    }
    else if(!validator.isEmail(email)){
        throw new Error("email id is invalid");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("password is weak");
    }
}
const validateEditProfile=(req)=>{
    const allowed=["firstName","lastName","email","skills","photoUrl","about"];
  const isEditAllowed=Object.keys(req.body).every((field)=>allowed.includes(field));
  return isEditAllowed;
}
module.exports={validateSignup,validateEditProfile}