const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// We will get this URL in Part 2, Step 3.
const BACKEND_URL = 'PASTE_YOUR_NEW_CLOUD_RUN_URL_HERE'; 

function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    const p = document.createElement('p');
    p.innerText = message;
    messageElement.appendChild(p);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;
    addMessage(messageText, 'user');
    userInput.value = '';
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: messageText }),
        });
        if (!response.ok) {
            // This will now show the actual server error
            const errorData = await response.json();
            throw new Error(`Server Error: ${response.status} (${errorData.error})`);
        }
        const data = await response.json();
        addMessage(data.reply, 'bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I am unable to connect right now. Please try again later.', 'bot');
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});