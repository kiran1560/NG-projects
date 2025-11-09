

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {
    const geminiApiKeyInput = document.getElementById('geminiApiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const clearApiKeyButton = document.getElementById('clearApiKey');
    const apiStatus = document.getElementById('apiStatus');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const outputContent = document.getElementById('outputContent');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const copyOutputButton = document.getElementById('copyOutput');

    // Feature-specific elements
    const amaInput = document.getElementById('amaInput');
    const amaGenerateButton = document.getElementById('amaGenerate');
    const summarizerInput = document.getElementById('summarizerInput');
    const summarizeGenerateButton = document.getElementById('summarizeGenerate');
    const ideaInput = document.getElementById('ideaInput');
    const ideaGenerateButton = document.getElementById('ideaGenerate');
    const definitionInput = document.getElementById('definitionInput');
    const definitionGenerateButton = document.getElementById('definitionGenerate');

    let GEMINI_API_KEY = '';
    let generativeModel = null; // Will store the initialized Gemini model

    const API_KEY_STORAGE_KEY = 'geminiApiKey';

    // Helper function to show/hide spinner
    const toggleLoading = (isLoading) => {
        if (isLoading) {
            loadingSpinner.style.display = 'block';
            outputContent.innerHTML = ''; // Clear previous output
            copyOutputButton.style.display = 'none';
        } else {
            loadingSpinner.style.display = 'none';
        }
    };

    // Helper function to display output
    const displayOutput = (content) => {
        outputContent.innerText = content;
        copyOutputButton.style.display = 'block';
    };

    // Initialize Gemini API
    const initializeGemini = (apiKey) => {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            generativeModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            apiStatus.textContent = 'API Key loaded successfully!';
            apiStatus.className = 'api-status success';
            // Enable all generate buttons
            [amaGenerateButton, summarizeGenerateButton, ideaGenerateButton, definitionGenerateButton]
                .forEach(btn => btn.disabled = false);
            return true;
        } catch (error) {
            console.error("Failed to initialize Gemini API:", error);
            apiStatus.textContent = 'Error initializing API. Check your key.';
            apiStatus.className = 'api-status error';
            // Disable all generate buttons
            [amaGenerateButton, summarizeGenerateButton, ideaGenerateButton, definitionGenerateButton]
                .forEach(btn => btn.disabled = true);
            generativeModel = null;
            return false;
        }
    };

    // Load API Key from localStorage
    const loadApiKey = () => {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
            geminiApiKeyInput.value = storedKey;
            GEMINI_API_KEY = storedKey;
            initializeGemini(GEMINI_API_KEY);
        } else {
            apiStatus.textContent = 'No API Key found. Please enter it above.';
            apiStatus.className = 'api-status';
            // Disable buttons if no key is present
            [amaGenerateButton, summarizeGenerateButton, ideaGenerateButton, definitionGenerateButton]
                .forEach(btn => btn.disabled = true);
        }
    };

    // Save API Key to localStorage
    saveApiKeyButton.addEventListener('click', () => {
        const newKey = geminiApiKeyInput.value.trim();
        if (newKey) {
            localStorage.setItem(API_KEY_STORAGE_KEY, newKey);
            GEMINI_API_KEY = newKey;
            initializeGemini(GEMINI_API_KEY);
        } else {
            apiStatus.textContent = 'Please enter a valid API Key.';
            apiStatus.className = 'api-status error';
        }
    });

    // Clear API Key from localStorage
    clearApiKeyButton.addEventListener('click', () => {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        geminiApiKeyInput.value = '';
        GEMINI_API_KEY = '';
        apiStatus.textContent = 'API Key cleared.';
        apiStatus.className = 'api-status';
        generativeModel = null;
        // Disable buttons
        [amaGenerateButton, summarizeGenerateButton, ideaGenerateButton, definitionGenerateButton]
            .forEach(btn => btn.disabled = true);
    });

    // Tab switching logic
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and hide all content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and show corresponding content
            button.classList.add('active');
            const targetTabId = button.dataset.tab;
            document.getElementById(targetTabId).classList.add('active');
        });
    });

    // Generic function to send prompt to Gemini API
    const sendToGemini = async (prompt) => {
        if (!generativeModel) {
            displayOutput('Error: Gemini API not initialized. Please set your API key.');
            return;
        }

        toggleLoading(true);
        try {
            const result = await generativeModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            displayOutput(text);
        } catch (error) {
            console.error("Error generating content:", error);
            displayOutput(`Error generating content: ${error.message}. Please try again later.`);
        } finally {
            toggleLoading(false);
        }
    };

    // --- Feature Implementations using Arrow Functions, Template Literals, Destructuring ---

    // Ask Me Anything
    amaGenerateButton.addEventListener('click', async () => {
        const question = amaInput.value.trim();
        if (!question) {
            alert('Please enter a question for Ask Me Anything.');
            return;
        }
        const prompt = `Answer the following question comprehensively and politely: "${question}"`;
        await sendToGemini(prompt);
    });

    // Quick Summarizer
    summarizeGenerateButton.addEventListener('click', async () => {
        const textToSummarize = summarizerInput.value.trim();
        if (!textToSummarize) {
            alert('Please paste some text to summarize.');
            return;
        }
        const prompt = `Summarize the following text concisely and clearly: \n\n"${textToSummarize}"`;
        await sendToGemini(prompt);
    });

    // Idea Spark
    ideaGenerateButton.addEventListener('click', async () => {
        const ideaRequest = ideaInput.value.trim();
        if (!ideaRequest) {
            alert('Please enter a topic for ideas (e.g., "blog post ideas", "story prompts").');
            return;
        }
        // Using template literals to construct a detailed prompt
        const prompt = `Generate a list of creative ideas based on the following request. Provide at least 5 distinct ideas:\n\nRequest: "${ideaRequest}"`;
        await sendToGemini(prompt);
    });

    // Definition Finder
    definitionGenerateButton.addEventListener('click', async () => {
        const termToDefine = definitionInput.value.trim();
        if (!termToDefine) {
            alert('Please enter a term to define.');
            return;
        }
    
        const prompt = `Provide a clear and concise definition and a brief explanation for the term: "${termToDefine}"`;
        await sendToGemini(prompt);
    });

    // Copy output to clipboard
    copyOutputButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(outputContent.innerText);
            copyOutputButton.textContent = 'Copied!';
            setTimeout(() => {
                copyOutputButton.textContent = 'Copy to Clipboard';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text. Please copy manually.');
        }
    });

    // Initial load
    loadApiKey();
});