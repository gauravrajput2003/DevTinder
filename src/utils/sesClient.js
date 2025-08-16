const { SESClient }= require("@aws-sdk/client-ses");
// Set the AWS Region.
const REGION = "ap-south-1";

// Debug: Check if environment variables are loaded
console.log("AWS Credentials Debug:");
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "✓ Loaded" : "✗ Missing");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "✓ Loaded" : "✗ Missing");

// Create SES service object.
const sesClient = new SESClient({ 
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});
module.exports= { sesClient };