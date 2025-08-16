const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const createVerificationEmailCommand = (toAddress, verificationLink, firstName) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">🚀 Welcome to DevNexus!</h1>
                  <p style="color: #666; margin: 5px 0 0 0;">Connect. Collaborate. Create.</p>
                </div>
                
                <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
                
                <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                    Hi <strong style="color: #4CAF50;">${firstName}</strong>,
                  </p>
                  <p style="margin: 15px 0; font-size: 16px; line-height: 1.6;">
                    Welcome to DevNexus! Please verify your email address to complete your registration and start connecting with fellow developers.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationLink}" 
                     style="background: linear-gradient(45deg, #4CAF50, #45a049); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            box-shadow: 0 4px 15px rgba(76,175,80,0.3);">
                    ✅ Verify Email Address
                  </a>
                </div>
                
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                    💡 <strong>Note:</strong> You'll need to verify your email to receive connection requests and other important notifications.
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <div style="text-align: center;">
                  <p style="color: #666; font-size: 14px; margin: 10px 0;">
                    Best regards,<br>
                    <strong style="color: #4CAF50;">The DevNexus Team</strong>
                  </p>
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">
                    If you didn't create this account, please ignore this email.
                  </p>
                </div>
              </div>
            </div>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Hi ${firstName},

Welcome to DevNexus! Please verify your email address to complete your registration.

Click here to verify: ${verificationLink}

You'll need to verify your email to receive connection requests and other important notifications.

Best regards,
The DevNexus Team

If you didn't create this account, please ignore this email.`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `🚀 Welcome to DevNexus - Please verify your email`,
      },
    },
    Source: "noreply@codeally.online",
  });
};

const sendVerificationEmail = async (recipientEmail, firstName, verificationToken) => {
  const verificationLink = `https://codeally.online/verify-email?token=${verificationToken}`;
  
  const sendEmailCommand = createVerificationEmailCommand(
    recipientEmail,
    verificationLink,
    firstName
  );

  try {
    console.log(`Sending verification email to ${recipientEmail}...`);
    const result = await sesClient.send(sendEmailCommand);
    console.log("Verification email sent successfully:", result);
    return result;
  } catch (caught) {
    console.error("Verification email failed:", caught.message);
    throw caught;
  }
};

module.exports = { sendVerificationEmail };
