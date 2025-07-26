class VarariChat {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.conversationHistory = [];
        
        this.init();
    }

    init() {
        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize input and focus
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.messageInput.focus();

        // Add initial timestamp to welcome message
        this.updateMessageTime();
    }

    handleInputChange() {
        const message = this.messageInput.value.trim();
        this.sendButton.disabled = !message;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Disable input while processing
        this.setLoading(true);

        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Clear input
        this.messageInput.value = '';
        this.handleInputChange();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory
                })
            });

            const data = await response.json();

            if (data.success) {
                // Add AI response to chat
                this.addMessage(data.response, 'ai');
                
                // Add to conversation history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: data.response
                });
            } else {
                throw new Error(data.error || 'Failed to get response');
            }

        } catch (error) {
            console.error('Error:', error);
            this.addErrorMessage('Sorry, I encountered an error. Please try again or call us at 22280808.');
        } finally {
            this.hideTypingIndicator();
            this.setLoading(false);
            this.messageInput.focus();
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (sender === 'ai') {
            messageContent.innerHTML = `<strong>Lara:</strong> ${this.formatMessage(content)}`;
        } else {
            messageContent.textContent = content;
        }

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addErrorMessage(content) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = content;
        this.chatMessages.appendChild(errorDiv);
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Convert line breaks to <br> tags
        content = content.replace(/\n/g, '<br>');
        
        // Convert bullet points
        content = content.replace(/^- (.+)$/gm, '• $1');
        
        // Convert phone numbers to clickable links
        content = content.replace(/(\d{8})/g, '<a href="tel:$1">$1</a>');
        
        // Convert URLs to clickable links
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        return content;
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    setLoading(loading) {
        this.sendButton.disabled = loading;
        this.messageInput.disabled = loading;
        
        if (loading) {
            this.chatMessages.classList.add('loading');
        } else {
            this.chatMessages.classList.remove('loading');
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    updateMessageTime() {
        // Update the initial welcome message time
        const initialMessage = this.chatMessages.querySelector('.message-time');
        if (initialMessage && !initialMessage.textContent) {
            initialMessage.textContent = this.getCurrentTime();
        }
    }

    // Method to clear conversation (could be useful for a reset button)
    clearConversation() {
        this.conversationHistory = [];
        this.chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <strong>Lara:</strong> Hello! I'm Lara from Varari Laundry. How can I help you today?
                </div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;
    }

    // Method to handle connection errors
    handleConnectionError() {
        this.addErrorMessage('Connection error. Please check your internet connection and try again.');
    }
}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.varariChat = new VarariChat();
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    if (window.varariChat) {
        window.varariChat.handleConnectionError();
    }
});

// Prevent form submission if wrapped in a form
document.addEventListener('submit', (e) => {
    e.preventDefault();
});
