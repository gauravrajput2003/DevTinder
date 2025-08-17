const cron=require("node-cron");
cron.schedule("0 8 * * * *",()=>{
try{

}
catch(err){
    console.log(err);
}
})