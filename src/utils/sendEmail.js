const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");
const { sendSMTPMail } = require("./smtpClient");

 
const createSendEmailCommand = (toAddress, fromAddress, recipientName, senderName) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [
        toAddress,
      ],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">🤝 DevNexus</h1>
                  <p style="color: #666; margin: 5px 0 0 0;">Connect. Collaborate. Create.</p>
                </div>
                
                <h2 style="color: #333; margin-bottom: 20px;">New Connection Request!</h2>
                
                <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                    Hi <strong style="color: #4CAF50;">${recipientName}</strong>,
                  </p>
                  <p style="margin: 15px 0; font-size: 16px; line-height: 1.6;">
                    <strong style="color: #333; font-size: 18px;">${senderName}</strong> would like to connect with you on DevNexus! 
                    They're interested in building professional relationships and collaborating with talented developers like you.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://codeally.online" 
                     style="background: linear-gradient(45deg, #4CAF50, #45a049); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            box-shadow: 0 4px 15px rgba(76,175,80,0.3);">
                    🚀 View & Respond to Request
                  </a>
                </div>
                
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                    💡 <strong>Tip:</strong> Building connections on DevNexus helps you discover new opportunities, 
                    share knowledge, and grow your professional network in the tech community.
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <div style="text-align: center;">
                  <p style="color: #666; font-size: 14px; margin: 10px 0;">
                    Best regards,<br>
                    <strong style="color: #4CAF50;">The DevNexus Team</strong>
                  </p>
                  <p style="margin: 15px 0;">
                    <a href="https://codeally.online" style="color: #4CAF50; text-decoration: none; font-weight: bold;">
                      🌐 Visit DevNexus
                    </a>
                  </p>
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">
                    This email was sent because ${senderName} requested to connect with you on DevNexus.
                  </p>
                </div>
              </div>
            </div>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Hi ${recipientName},

${senderName} would like to connect with you on DevNexus!

They're interested in building professional relationships and collaborating with talented developers like you.

Visit DevNexus to view and respond to this connection request:
https://codeally.online

Building connections on DevNexus helps you discover new opportunities, share knowledge, and grow your professional network in the tech community.

Best regards,
The DevNexus Team
https://codeally.online

This email was sent because ${senderName} requested to connect with you on DevNexus.`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `🤝 ${senderName} wants to connect with you on DevNexus`,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      "gauravkumarsingh010103@gmail.com"  // Set your personal email as reply-to
    ],
  });
};

const run = async (recipientEmail, recipientName, senderName) => {
  // Build email content once
  const subject = `🤝 ${senderName} wants to connect with you on DevNexus`;
  const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">🤝 DevNexus</h1>
                  <p style="color: #666; margin: 5px 0 0 0;">Connect. Collaborate. Create.</p>
                </div>
                
                <h2 style="color: #333; margin-bottom: 20px;">New Connection Request!</h2>
                
                <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                    Hi <strong style="color: #4CAF50;">${recipientName}</strong>,
                  </p>
                  <p style="margin: 15px 0; font-size: 16px; line-height: 1.6;">
                    <strong style="color: #333; font-size: 18px;">${senderName}</strong> would like to connect with you on DevNexus! 
                    They're interested in building professional relationships and collaborating with talented developers like you.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://codeally.online" 
                     style="background: linear-gradient(45deg, #4CAF50, #45a049); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            box-shadow: 0 4px 15px rgba(76,175,80,0.3);">
                    🚀 View & Respond to Request
                  </a>
                </div>
                
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                    💡 <strong>Tip:</strong> Building connections on DevNexus helps you discover new opportunities, 
                    share knowledge, and grow your professional network in the tech community.
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <div style="text-align: center;">
                  <p style="color: #666; font-size: 14px; margin: 10px 0;">
                    Best regards,<br>
                    <strong style="color: #4CAF50;">The DevNexus Team</strong>
                  </p>
                  <p style="margin: 15px 0;">
                    <a href="https://codeally.online" style="color: #4CAF50; text-decoration: none; font-weight: bold;">
                      🌐 Visit DevNexus
                    </a>
                  </p>
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">
                    This email was sent because ${senderName} requested to connect with you on DevNexus.
                  </p>
                </div>
              </div>
            </div>`;
  const text = `Hi ${recipientName},\n\n${senderName} would like to connect with you on DevNexus!\n\nThey're interested in building professional relationships and collaborating with talented developers like you.\n\nVisit DevNexus to view and respond to this connection request:\nhttps://codeally.online\n\nBuilding connections on DevNexus helps you discover new opportunities, share knowledge, and grow your professional network in the tech community.\n\nBest regards,\nThe DevNexus Team\nhttps://codeally.online\n\nThis email was sent because ${senderName} requested to connect with you on DevNexus.`;

  // First try SES
  try {
    const sendEmailCommand = createSendEmailCommand(
      recipientEmail,
      "noreply@codeally.online",
      recipientName,
      senderName
    );
    console.log(`Attempting SES email to ${recipientEmail}...`);
    const result = await sesClient.send(sendEmailCommand);
    console.log("SES email sent successfully:", result?.MessageId || result);
    return { provider: "ses", result };
  } catch (sesErr) {
    console.warn("SES send failed, will try SMTP fallback:", sesErr?.message || sesErr);
  }

  // Fallback: SMTP
  const smtpFrom = process.env.SMTP_FROM || "noreply@codeally.online";
  const replyTo = "gauravkumarsingh010103@gmail.com";
  const smtpResult = await sendSMTPMail({
    to: recipientEmail,
    subject,
    html,
    text,
    from: smtpFrom,
    replyTo,
  });
  console.log("SMTP email sent:", smtpResult?.messageId || smtpResult);
  return { provider: "smtp", result: smtpResult };
};
module.exports={run};