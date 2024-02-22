let chatState = {
    step: 'init',
    selectedClothingItem: null,
    userDetails: {
        age: null,
        gender: null,
        weight: null,
        height: null,
        measurements: null,
        shoeSize: null
    }
};

function restartChatbot() {
    // Clear the messages
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';

    // Reset selected clothing item
    selectedClothingItem = null;

    // Show the clothing-selection div
    document.getElementById('clothing-selection').style.display = 'block';

    // Call initializeChatbot to display the greeting message again
    initializeChatbot();
}

// Call this function when the chatbot loads to display the greeting message
function initializeChatbot() {
    const greetingMessage = "Hello! Get started by selecting the apparel item you want to find your size in.";
    displayMessage(greetingMessage, 'bot');
}

function displayMessage(message, sender) {
    const messagesContainer = document.getElementById('messages');
    const msgElement = document.createElement('div');
    
    // Create a span for the sender's designation
    const senderSpan = document.createElement('span');
    senderSpan.textContent = sender === 'bot' ? 'Bot: ' : 'You: ';
    senderSpan.className = sender === 'bot' ? 'bot-designation' : 'user-designation';
    
    // Append the sender's designation span and the message text to the msgElement
    msgElement.appendChild(senderSpan);
    msgElement.appendChild(document.createTextNode(message));
    
    // Use this class for styling user vs bot messages differently
    msgElement.className = `msgElement ${sender}`;
    
    messagesContainer.appendChild(msgElement);
}

let selectedClothingItem = null;

function selectClothingItem(item) {
    chatState.selectedClothingItem = item;
    selectedClothingItem = item;
    let promptMessage = "";
    switch (item) {
        case 'shirt':
            promptMessage = "Please enter your height.";
            break;
        case 'pants':
            promptMessage = "Please enter your waist and inseam measurements.";
            break;
        case 'shoes':
            promptMessage = "Please enter your shoe size (US, EU, UK, etc.).";
            break;
        // Add more cases for different clothing items as needed
        default:
            promptMessage = "Please select a clothing item.";
            break;
    }
    displayMessage(promptMessage, 'bot');
    
    // Hide the clothing-selection div
    document.getElementById('clothing-selection').style.display = 'none';
}

// The rest of the functions remain unchanged


// Call initializeChatbot when the window loads
window.onload = initializeChatbot;


function getAdvice(userMessage) {
    // Handle the conversation based on the current step
    switch (chatState.step) {
        case 'init':
            // Store the initial measurement based on the selected clothing item
            if (selectedClothingItem === 'shirt') {
                chatState.userDetails.height = userMessage;
                chatState.step = 'askedHeight';
                displayMessage("Thank you. Now, please tell me your gender (M/F/Other).", 'bot');
            } else if (selectedClothingItem === 'pants') {
                chatState.userDetails.measurements = userMessage;
                chatState.step = 'askedMeasurements';
                displayMessage("Thank you. Now, please tell me your gender (M/F/Other).", 'bot');
            } else if (selectedClothingItem === 'shoes') {
                chatState.userDetails.shoeSize = userMessage;
                chatState.step = 'askedShoeSize';
                displayMessage("Thank you. Now, please tell me your gender (M/F/Other).", 'bot');
            }
            break;
        case 'askedHeight':
        case 'askedMeasurements':
        case 'askedShoeSize':
            chatState.userDetails.gender = userMessage;
            chatState.step = 'askedGender';
            displayMessage("Thank you. Now, please tell me your age.", 'bot');
            break;
        case 'askedGender':
            chatState.userDetails.age = userMessage;
            chatState.step = 'askedAge';
            displayMessage("Thank you. Now, please tell me your weight in pounds (optional, type 'skip' to continue).", 'bot');
            break;
        case 'askedAge':
            // Optional weight, so check if the user entered it or wants to skip
            if (userMessage.trim().toLowerCase() !== 'skip') {
                chatState.userDetails.weight = userMessage;
            }
            chatState.step = 'askedWeight';
            // Now that all information is gathered, determine the size
            const advice = determineResponse();
            displayMessage(advice, 'bot');
            // Reset the chat state for a new conversation
            chatState.step = 'init';
            break;
        default:
            displayMessage("I'm not sure what you're trying to say. Can you please select a clothing item to start?", 'bot');
            chatState.step = 'init'; // Reset to initial state
            break;
    }
}

function sendMessage() {
    try {
        const input = document.getElementById('userInput');
        const message = input.value.trim(); // Trim whitespace from the input
        console.log("User message:", message); // Log the user message
        if (message) {
            displayMessage(message, 'user');
            getAdvice(message);
            input.value = ''; // Clear input after sending
        } else {
            console.log("No message entered by the user."); // Log when no message is entered
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

function determineResponse() {
    let size = 'Medium'; // Default size

    const heightInInches = convertToInches(chatState.userDetails.height);
    const weightInPounds = parseInt(chatState.userDetails.weight);
    const gender = chatState.userDetails.gender.toLowerCase();
    const age = parseInt(chatState.userDetails.age);

    // Example logic for determining shirt size
    if (chatState.selectedClothingItem === 'shirt') {
        if (gender === 'm' || gender === 'male') {
            size = maleShirtSize(heightInInches, weightInPounds);
        } else if (gender === 'f' || gender === 'female') {
            size = femaleShirtSize(heightInInches, weightInPounds);
        }
    }

    // Example logic for determining pants size
    else if (chatState.selectedClothingItem === 'pants') {
        const measurements = chatState.userDetails.measurements.split('x');
        const waistInInches = parseInt(measurements[0]);
        const inseamInInches = parseInt(measurements[1]);
        if (gender === 'm' || gender === 'male') {
            size = malePantsSize(waistInInches, inseamInInches);
        } else if (gender === 'f' || gender === 'female') {
            size = femalePantsSize(waistInInches, inseamInInches);
        }
    }

    // Example logic for determining shoe size
    else if (chatState.selectedClothingItem === 'shoes') {
        const shoeSize = parseFloat(chatState.userDetails.shoeSize);
        size = unisexShoeSize(shoeSize, age);
    }

    return `Based on the provided information, we recommend a size ${size} for your ${chatState.selectedClothingItem}.`;
}

// Helper functions for size determination
function maleShirtSize(height, weight) {
    // Simplified size chart logic for male shirts
    if (height < 65) { // Under 5'5"
        return weight > 160 ? 'Medium' : 'Small';
    } else if (height >= 65 && height <= 72) { // 5'5" to 6'
        return weight > 200 ? 'Large' : 'Medium';
    } else { // Over 6'
        return weight > 240 ? 'X-Large' : 'Large';
    }
}

function femaleShirtSize(height, weight) {
    // Simplified size chart logic for female shirts
    if (height < 60) { // Under 5'
        return weight > 130 ? 'Medium' : 'Small';
    } else if (height >= 60 && height <= 67) { // 5' to 5'7"
        return weight > 170 ? 'Large' : 'Medium';
    } else { // Over 5'7"
        return weight > 210 ? 'X-Large' : 'Large';
    }
}

function malePantsSize(waist, inseam) {
    // Simplified size chart logic for male pants
    if (waist <= 30) {
        return inseam < 30 ? 'Small' : 'Medium';
    } else if (waist > 30 && waist <= 36) {
        return inseam < 32 ? 'Medium' : 'Large';
    } else {
        return inseam < 34 ? 'Large' : 'X-Large';
    }
}

function femalePantsSize(waist, inseam) {
    // Simplified size chart logic for female pants
    if (waist <= 28) {
        return inseam < 30 ? 'Small' : 'Medium';
    } else if (waist > 28 && waist <= 34) {
        return inseam < 32 ? 'Medium' : 'Large';
    } else {
        return inseam < 34 ? 'Large' : 'X-Large';
    }
}

function unisexShoeSize(shoeSize, age) {
    // Simplified size chart logic for unisex shoes
    if (age <= 18) {
        return shoeSize <= 8 ? 'Small' : shoeSize <= 10 ? 'Medium' : 'Large';
    } else {
        return shoeSize <= 9 ? 'Medium' : shoeSize <= 11 ? 'Large' : 'X-Large';
    }
}

// Helper function to convert height to inches
function convertToInches(height) {
    // Assuming height is a string like "5'7" or "67 inches" or "170 cm"
    if (!height) {
        console.error("Height is not provided or invalid");
        return 0; // Return a default value or handle the error as appropriate
    }
    let inches = 0;
    if (height.includes("'")) {
        // Height is in the format of feet and inches, e.g., "5'7"
        const parts = height.split("'");
        const feet = parseInt(parts[0]);
        const additionalInches = parts[1] ? parseInt(parts[1].replace(/[^0-9]/g, '')) : 0;
        inches = (feet * 12) + additionalInches;
    } else if (height.toLowerCase().includes("inches")) {
        // Height is specified in inches, e.g., "67 inches"
        inches = parseInt(height);
    } else if (height.toLowerCase().includes("cm")) {
        // Height is specified in centimeters, e.g., "170 cm"
        const cm = parseInt(height);
        inches = Math.round(cm / 2.54); // Convert cm to inches
    }
    return inches;
}
// Example of animating the bot's response for a nicer effect
function animateBotResponse(message) {
    // You can expand this function to animate the bot's response
    displayMessage(message, 'bot');
}
