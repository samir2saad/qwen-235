# Varari Laundry AI Assistant

A Node.js web application that provides an AI-powered chat interface for Varari Laundry customers. The application uses OpenRouter API with the Qwen model to provide customer service assistance.

## Features

- 🤖 AI-powered chat assistant (Lara) specialized in Varari Laundry services
- 💬 Real-time conversation with typing indicators
- 📱 Responsive design for mobile and desktop
- 🎨 Modern, clean UI with smooth animations
- 📍 Complete pricing and branch location information
- 🌐 Supports both English and Arabic interactions

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- OpenRouter API key

## Installation

1. Clone or download the project files
2. Navigate to the project directory:
   ```bash
   cd varari-ai-chat
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure environment variables:
   - The `.env` file is already configured with the API key
   - You can modify the `PORT` if needed (default is 3000)

## Usage

### Option 1: Quick Start (Windows)
Double-click the `start-server.bat` file to start the server automatically.

### Option 2: Command Line
1. Open Command Prompt or PowerShell
2. Navigate to the project directory:
   ```bash
   cd varari-ai-chat
   ```
3. Start the server:
   ```bash
   npm start
   ```

### Option 3: Keep Server Running Continuously
To run the server in the background and keep it running:

**Windows (Command Prompt):**
```cmd
cd varari-ai-chat
start /min npm start
```

**Windows (PowerShell):**
```powershell
cd varari-ai-chat
Start-Process -WindowStyle Minimized npm start
```

**For Development (Auto-restart on file changes):**
```bash
# Install nodemon globally (one time only)
npm install -g nodemon

# Run with auto-restart
nodemon server.js
```

### Accessing the Application
1. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```
2. Start chatting with Lara, the AI assistant!

### Stopping the Server
- Press `Ctrl+C` in the terminal/command prompt
- Or close the terminal window
- If running in background, use Task Manager to end the Node.js process

## API Endpoints

- `GET /` - Serves the main chat interface
- `POST /api/chat` - Handles chat messages and returns AI responses
- `GET /api/health` - Health check endpoint

## Project Structure

```
varari-ai-chat/
├── server.js          # Express server with OpenRouter API integration
├── package.json       # Project dependencies and scripts
├── .env              # Environment variables
├── README.md         # This file
└── public/           # Frontend files
    ├── index.html    # Main HTML page
    ├── style.css     # Styling and responsive design
    └── script.js     # Frontend JavaScript functionality
```

## Configuration

### Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### AI Model Settings

The application uses the following OpenRouter configuration:
- Model: `qwen/qwen3-235b-a22b-07-25:free`
- Temperature: 0.3
- Max Tokens: 300

## Features in Detail

### AI Assistant Capabilities

Lara can help with:
- **Pricing Information**: Complete pricing for all garment categories
- **Branch Locations**: All 24 Varari branches with maps and coordinates
- **Services**: Laundry, dry-cleaning, steam pressing, pickup/delivery
- **Company Information**: About Varari, contact details, FAQs
- **Cultural Sensitivity**: Kuwaiti hospitality and cultural expressions

### Frontend Features

- **Real-time Chat**: Instant messaging with typing indicators
- **Responsive Design**: Works on all device sizes
- **Message Formatting**: Automatic formatting of phone numbers and URLs
- **Error Handling**: Graceful error handling with user-friendly messages
- **Conversation History**: Maintains context throughout the conversation

## Customization

### Modifying the AI Prompt

To customize Lara's behavior, edit the `systemPrompt` variable in `server.js`. The prompt includes:
- Identity and behavior guidelines
- Complete pricing data
- Branch locations
- Company information
- Response formatting rules

### Styling Changes

Modify `public/style.css` to change:
- Color scheme
- Layout and spacing
- Animations and transitions
- Mobile responsiveness

### Adding Features

The modular structure makes it easy to add new features:
- Add new API endpoints in `server.js`
- Extend frontend functionality in `public/script.js`
- Add new UI components in `public/index.html`

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if Node.js is installed: `node --version`
   - Ensure all dependencies are installed: `npm install`
   - Verify the port is not in use

2. **AI responses not working**
   - Check your OpenRouter API key in `.env`
   - Verify internet connection
   - Check the browser console for error messages

3. **Styling issues**
   - Clear browser cache
   - Check if `style.css` is loading properly
   - Verify file paths are correct

### Development Mode

For development with auto-restart, you can install nodemon:
```bash
npm install -g nodemon
nodemon server.js
```

## Security Notes

- The API key is included in the `.env` file for demo purposes
- In production, use environment variables or secure key management
- Consider implementing rate limiting for the API endpoints
- Add input validation and sanitization for production use

## License

MIT License - feel free to modify and use for your projects.

## Support

For issues related to:
- **Varari Laundry Services**: Call 22280808
- **Technical Issues**: Check the troubleshooting section above
- **OpenRouter API**: Visit [OpenRouter Documentation](https://openrouter.ai/docs)

---

Built with ❤️ for Varari Global Laundry & Steam Pressing Co. W.L.L
