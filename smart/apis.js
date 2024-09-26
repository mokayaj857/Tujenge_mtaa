const express = require('express');
const bodyParser = require('body-parser');
const AfricasTalking = require('africastalking')({
    apiKey: 'atsk_aa2a23bbc0de3393cd188373c5155e176e8a9c791f904b3795f71c4f3fdd849a6d4f7e14',
    username: 'EMID'
});
const sms = AfricasTalking.SMS;

function sendMessage(phoneNumber, pickupLocation) {
    const options = {
        to: [phoneNumber],
        message: `Thank you! Your pickup location is: ${pickupLocation}. We will contact you soon.`,
        from: '20880'
    };

    return sms.send(options)
        .then(response => console.log('Message sent:', response))
        .catch(error => console.log('Error:', error));
}

// Simulating payment processing for the solar energy plan
function processSolarPayment(phoneNumber, plan) {
    return new Promise((resolve, reject) => {
        const isPaymentSuccessful = Math.random() < 0.8; // Simulate 80% success rate

        if (isPaymentSuccessful) {
            resolve(`Payment successful for plan: ${plan}`);
        } else {
            reject('Payment failed due to network issues');
        }
    });
}
function sendMessage1(phoneNumber, plan) {
    const options = {
        to: [phoneNumber],
        message: `Your ${plan} request was received successfully.`,
        from: '20880'
    };

    return sms.send(options)
        .then(response => console.log('Message sent:', response))
        .catch(error => console.log('Error:', error));
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = '';
    const textValueArray = text.split('*');
    const level = textValueArray.length; // Determine the user's progression based on how many inputs they've made

    // Starting the session
    if (text === '') {
        response = `CON Welcome to Tujenge-mtaani\n1. Register\n2. Login`;
    } 
    
    // Registration flow - Step 1: Enter ID
    else if (text === '1') {
        response = `CON Please enter your ID number:`;
    } 
    
    // Registration flow - Step 2: Confirm ID
    else if (level === 2 && text.startsWith('1*')) {
        const enteredID = textValueArray[1];
        response = `CON Please confirm your ID number: ${enteredID}\n1. Yes\n2. No`;
    } 
    
    // If ID is confirmed, show options menu
    else if (text === `1*${textValueArray[1]}*1` && level === 3) {
        response = `CON Please select an option:
        1. SAFISHA MTAA (Enter Pickup Location)
        2. SOLAR-PRODUCTS Payment
        3. What are Loyalty points?
        4. My Account
        5. Exit`;
    }

    // SAFISHA MTAA (Pickup location input) - Step 1: Ask for pickup location
    else if (text === `1*${textValueArray[1]}*1*1` && level === 4) {
        response = `CON Please enter your pickup location:`;
    }

    // SAFISHA MTAA - Step 2: Process pickup location and send SMS
    else if (level === 5 && text.startsWith(`1*${textValueArray[1]}*1*1*`)) {
        const pickupLocation = textValueArray[4]; // Get the pickup location from user input

        // Send confirmation SMS
        sendMessage(phoneNumber, pickupLocation);

        response = `END Thank you for submitting your pickup location: ${pickupLocation}. You have earned 10 mazingira points`;
    }

    // SOLAR-PRODUCTS Payment flow - Step 1: Ask for the solar plan selection
    else if (text === `1*${textValueArray[1]}*1*2` && level === 4) {
        response = `CON Please select your solar energy plan:
        1. Basic Plan
        2. Premium Plan`;
    }

    // SOLAR-PRODUCTS Payment flow - Step 2: Process payment based on the plan
    else if (level === 5 && text.startsWith(`1*${textValueArray[1]}*1*2*`)) {
      
        const selectedPlan = text.endsWith('1') ? 'Basic Plan' : 'Premium Plan'; // Store the selected plan
sendMessage1(phoneNumber, selectedPlan); // Pass the selected plan to sendMessage1 function


        processSolarPayment(phoneNumber, selectedPlan)
            .then(successMessage => {
                response = `END ${successMessage}`;
                res.set('Content-Type', 'text/plain');
                res.send(response);
            })
            .catch(() => {
                response = `END Dear customer, the network is experiencing technical problems and your request was not processed. Please try again later.`;
                res.set('Content-Type', 'text/plain');
                res.send(response);
            });

        return;
    }

    // Login flow - Step 1: Enter ID for login
    else if (text === '2') {
        response = `CON Please enter your ID number to access account:`;
    } 
    
    // Login flow - Step 2: Confirm login
    else if (level === 2 && text.startsWith('2*')) {
        const idNumber = textValueArray[1];
        response = `END You have successfully logged in with ID: ${idNumber}`;
    }

    // Send the response back to the USSD API
    res.set('Content-Type', 'text/plain');
    res.send(response);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
