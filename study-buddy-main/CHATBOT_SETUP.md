# Environment Setup for StudyBuddy AI Chatbot

## Required Environment Variables

To use the AI chatbot functionality, you need to set up a Google Gemini API key.

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the generated key

### 2. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file is already included in `.gitignore`
- For production deployment, set environment variables through your hosting platform
- The chatbot includes fallback responses if the API is unavailable

### 4. API Usage and Limits

- Google Gemini API has usage limits and quotas
- The chatbot is configured with content safety filters
- Input is limited to 1000 characters for security
- Duplicate messages are automatically filtered

## Troubleshooting

If the chatbot shows fallback responses instead of AI responses:

1. Check that your API key is correctly set in the `.env` file
2. Verify the API key is valid by testing it directly with Google's API
3. Check browser console for specific error messages
4. Ensure your API key has the necessary permissions for the Gemini API