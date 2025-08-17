require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');

async function testProductionAccess() {
    try {
        console.log('Testing production access...');
        console.log('Sending email to: gaurav032002@gmail.com (unverified email)');
        
        const result = await sendEmail.run(
            'gaurav032002@gmail.com',  // Your unverified email
            'Gaurav',                  // Your name
            'Production Test'          // Test sender
        );
        
        console.log('🎉 PRODUCTION ACCESS APPROVED! Email sent successfully!');
        console.log('Result:', result);
        return true;
    } catch (error) {
        if (error.message.includes('Email address is not verified')) {
            console.log('❌ Still in sandbox mode - production access not yet approved');
            console.log('Error:', error.message);
            return false;
        } else {
            console.error('❌ Different error:', error.message);
            return false;
        }
    }
}

testProductionAccess();
