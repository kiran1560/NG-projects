// Load environment variables from .env file FIRST.
// This ensures process.env variables are available before other code uses them.
require('dotenv').config(); 

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const cors = require('cors'); // Import CORS for potential cross-origin issues during development

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 by default, or an environment variable

// --- Middleware ---

// Enable CORS for all routes - IMPORTANT for development if frontend is served from a different origin
// For production, you might want to configure CORS more strictly.
app.use(cors()); 

// To parse JSON request bodies
app.use(express.json()); 

// Serve static files from the 'public' directory
// The __dirname is the directory where the current script resides.
app.use(express.static(path.join(__dirname, 'public'))); 

// --- Initialize Google Generative AI ---
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey || geminiApiKey === 'YOUR_GEMINI_API_KEY') {
    console.error('CRITICAL ERROR: GEMINI_API_KEY is not set or is still a placeholder in your .env file.');
    // Exit the process if the API key is not configured, as the app won't function.
    process.exit(1); 
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

// --- API Route for asking Gemini AI ---
app.post('/ask-gemini', async (req, res) => {
    const { question } = req.body; // Destructure 'question' from the request body

    // Basic input validation
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: 'Question is required and must be a non-empty string.' });
    }

    console.log(`Received question: "${question}"`); // Log the question for debugging

    try {
        // Use a more descriptive model name if available, or stick to 'gemini-2.5-flash'
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // gemini-1.5-flash is often a good default
        
        const result = await model.generateContent(question);
        const response = await result.response;
        const text = response.text();
        
        res.json({ answer: text }); // Send the AI's answer back as JSON

    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Provide more user-friendly error messages based on common issues
        let errorMessage = 'Failed to get an answer from Gemini AI.';
        if (error.message.includes('API key not valid')) { // Specific check for API key issues
            errorMessage = 'Authentication error: Your Gemini API Key might be invalid.';
        } else if (error.response && error.response.status === 429) { // Rate limit
            errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (error.message.includes('quota')) { // Quota limit
            errorMessage = 'Quota exceeded. Please check your usage limits.';
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: error.message // Include technical details for debugging
        });
    }
});

// --- Catch-all for undefined routes ---
// This should be placed after all your specific routes.
app.use((req, res) => {
    // If no routes above have handled the request, it's a 404 Not Found.
    console.warn(`404 Not Found: Method=${req.method}, Path=${req.path}`);
    res.status(404).send('Not Found');
});

// --- Global Error Handling Middleware ---
// This catches errors that occur outside of specific route handlers.
// It's good practice to have a general error handler.
app.use((err, req, res, next) => {
    console.error('An unhandled server error occurred:', err);
    res.status(500).json({ 
        error: 'An unexpected server error occurred.',
        details: err.message || 'No specific error message provided.'
    });
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
});