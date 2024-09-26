const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/ussd', (req, res) => {
    // Read the variables sent via POST from our API
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = '';
    const textValueArray = text.split('*'); // Split the text input by '*'
    const userInput = textValueArray[1]; // This stores the ID number

    if (text === '') {
        // First request: Initial USSD menu
        response = `CON Welcome to Tujenge-mtaani\n\n1. Register\n2. Login`;
    } else if (text === '1') {
        // User chose to register, asking for ID
        response = `CON Please enter your ID number:`;
    } else if (text.startsWith('1*') && textValueArray.length === 2) {
        // Capture the ID and ask for confirmation
        response = `CON Please confirm ID number: ${userInput}\n1. Yes\n2. No`;
    } else if (text.startsWith(`1*${userInput}*1`)) {
        // If user confirms the ID (Yes)
        response = `END Your ID number ${userInput} has been confirmed.`;
    } else if (text.startsWith(`1*${userInput}*2`)) {
        // If user declines the ID (No)
        response = `CON Please re-enter your ID number:`;
    } else if (text === '2') {
        // Business logic for login option
        response = `CON Please enter your ID number to access account:`;
    } else if (text.startsWith('2*')) {
        // User enters their ID for login
        const idNumber = text.split('*')[1];
        response = `END You have successfully logged in with ID: ${idNumber}`;
    }

    // Send the response back to the API
    res.set('Content-Type', 'text/plain');
    res.send(response);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
