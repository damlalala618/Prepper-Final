# Prepper AI Assistant - OpenAI Setup

## Getting Started with OpenAI GPT

The AI Assistant "Pep" is powered by OpenAI's GPT-3.5-turbo model.

### Setup Instructions

1. **Get an OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in to your OpenAI account
   - Click "Create new secret key"
   - Copy your API key (it starts with `sk-`)

2. **Configure the API Key**
   - Open `prepper-backend/.env`
   - Replace `your-openai-api-key-here` with your actual API key:
     ```
     OPENAI_API_KEY=sk-your-actual-key-here
     ```
   - Save the file

3. **Start the Backend**
   ```bash
   cd prepper-backend
   node src/index.js
   ```

4. **Test the AI Assistant**
   - Open the app in your browser
   - Click the 🌶️ button (bottom right)
   - Try asking: "What's a good quick dinner idea?"

### Demo Mode

If no API key is configured, the assistant will run in **demo mode** with pre-programmed responses. This is useful for:
- Testing the UI
- Development without API costs
- Demos without exposing API keys

### API Costs

OpenAI GPT-3.5-turbo pricing (as of 2026):
- ~$0.002 per 1,000 tokens
- Most conversations cost less than $0.01
- Monitor usage at https://platform.openai.com/usage

### Upgrading to GPT-4

For better responses, edit `src/index.js` and change:
```javascript
model: 'gpt-3.5-turbo',  // Change to 'gpt-4-turbo'
```

Note: GPT-4 is more expensive but provides higher quality responses.

### Troubleshooting

**Error: "Incorrect API key provided"**
- Double-check your API key in `.env`
- Ensure there are no extra spaces
- Restart the backend server

**Assistant not responding**
- Check backend console for errors
- Verify backend is running on port 4000
- Check browser console for network errors

**High API costs**
- Reduce `max_tokens` from 500 to 200-300
- Use GPT-3.5-turbo instead of GPT-4
- Implement rate limiting in production
