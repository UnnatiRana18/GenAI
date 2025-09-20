// Get all the necessary elements from the HTML
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// This is the correct and final URL for your deployed backend AI.
const BACKEND_URL = 'https://wellness-bot-gemini-api-864225446074.asia-south1.run.app'; 

// Function to add a message to the chat box
function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    const p = document.createElement('p');
    p.innerText = message;
    messageElement.appendChild(p);
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

// Function to handle sending a message
async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;

    // Display the user's message immediately
    addMessage(messageText, 'user');
    userInput.value = '';

    try {
        // Send the message to the backend AI
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: messageText }),
        });

        if (!response.ok) {
            // If the server returns an error, try to display it
            const errorData = await response.json();
            throw new Error(`Server Error: ${response.status} (${errorData.error})`);
        }

        const data = await response.json();
        const botResponse = data.reply;
        
        // Display the AI's response
        addMessage(botResponse, 'bot');

    } catch (error) {
        // Display a user-friendly error message and log the technical details
        console.error('Error:', error);
        addMessage('Sorry, I am unable to connect right now. Please try again later.', 'bot');
    }
}

// Event Listeners for the send button and the 'Enter' key
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
