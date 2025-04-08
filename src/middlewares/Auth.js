const adminAuth=(res,req,next)=>{
    const token="xyzabc";
    const isAdminAuthorized=token==="xyzabckk  ";
    if(!isAdminAuthorized){
        res.status(401).send("unauthorized request");
    }
    else{
        next();
    }
};
module.exports={adminAuth};