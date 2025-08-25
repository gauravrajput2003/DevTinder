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
const validateEditProfile = (req) => {
    const allowed = ["firstName", "lastName", "email", "skills", "photoUrl", "about"];
    const keys = Object.keys(req.body);
    // Only allow allowed fields
    const isEditAllowed = keys.every((field) => allowed.includes(field));
    if (!isEditAllowed) return false;
    // Only validate firstName if present (for PATCH)
    if (typeof req.body.firstName !== 'undefined') {
        if (!req.body.firstName || req.body.firstName.length < 4 || req.body.firstName.length > 50) {
            throw new Error("First name must be 4-50 characters if provided.");
        }
    }
    if (typeof req.body.lastName !== 'undefined') {
        if (req.body.lastName.length > 50) {
            throw new Error("Last name must be at most 50 characters.");
        }
    }
    return true;
}
module.exports={validateSignup,validateEditProfile}