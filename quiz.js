document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');

    const startQuizBtn = document.getElementById('start-quiz-btn');
    const questionText = document.getElementById('question-text');
    const answerButtonsContainer = document.getElementById('answer-buttons');
    const questionNumberSpan = document.getElementById('question-number');
    const progressBarFill = document.querySelector('.progress-bar-fill');

    const scoreText = document.getElementById('score-text');
    const feedbackText = document.getElementById('feedback-text');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');

    // 2. Quiz Data (Arrays & Objects)
    const quizQuestions = [
        {
            question: "What is the capital of France?",
            answers: [
                { text: "Berlin", correct: false },
                { text: "Madrid", correct: false },
                { text: "Paris", correct: true },
                { text: "Rome", correct: false }
            ]
        },
        {
            question: "Which planet is known as the 'Red Planet'?",
            answers: [
                { text: "Earth", correct: false },
                { text: "Mars", correct: true },
                { text: "Jupiter", correct: false },
                { text: "Venus", correct: false }
            ]
        },
        {
            question: "What is the largest ocean on Earth?",
            answers: [
                { text: "Atlantic Ocean", correct: false },
                { text: "Indian Ocean", correct: false },
                { text: "Arctic Ocean", correct: false },
                { text: "Pacific Ocean", correct: true }
            ]
        },
        {
            question: "Who wrote 'Romeo and Juliet'?",
            answers: [
                { text: "Charles Dickens", correct: false },
                { text: "William Shakespeare", correct: true },
                { text: "Jane Austen", correct: false },
                { text: "Mark Twain", correct: false }
            ]
        },
        {
            question: "What is the chemical symbol for water?",
            answers: [
                { text: "O2", correct: false },
                { text: "H2O", correct: true },
                { text: "CO2", correct: false },
                { text: "NACL", correct: false }
            ]
        }
    ];

    // 3. Quiz State Variables
    let currentQuestionIndex = 0;
    let score = 0;

    // 4. Functions

    // Displays a given screen and hides others
    function showScreen(screenToShow) {
        [startScreen, quizScreen, resultsScreen].forEach(screen => {
            screen.classList.remove('active');
        });
        screenToShow.classList.add('active');
    }

    // Starts the quiz
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        showScreen(quizScreen);
        displayQuestion();
        updateProgressBar();
    }

    // Displays the current question and its answers
    function displayQuestion() {
        // Clear previous answers
        answerButtonsContainer.innerHTML = '';
        const questionData = quizQuestions[currentQuestionIndex];
        questionText.textContent = questionData.question;

        // Update question number
        questionNumberSpan.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;

        // Create answer buttons
        questionData.answers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer.text;
            button.classList.add('answer-btn');
            if (answer.correct) {
                button.dataset.correct = true; // Store correct answer info
            }
            button.addEventListener('click', selectAnswer);
            answerButtonsContainer.appendChild(button);
        });
    }

    // Handles user selecting an answer
    function selectAnswer(e) {
        const selectedButton = e.target;
        const isCorrect = selectedButton.dataset.correct === "true";

        // Disable all answer buttons after selection
        Array.from(answerButtonsContainer.children).forEach(button => {
            button.removeEventListener('click', selectAnswer); // Remove listener to prevent multiple clicks
            if (button.dataset.correct === "true") {
                button.classList.add('correct'); // Highlight correct answer
            } else {
                button.classList.add('incorrect'); // Highlight incorrect answers
            }
            button.style.pointerEvents = 'none'; // Prevent further clicks
        });

        if (isCorrect) {
            score++;
        }

        // Move to next question after a short delay
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                displayQuestion();
                updateProgressBar();
            } else {
                showResults();
            }
        }, 1000); // 1 second delay to see correct/incorrect feedback
    }

    // Updates the progress bar
    function updateProgressBar() {
        const progress = ((currentQuestionIndex) / quizQuestions.length) * 100;
        progressBarFill.style.width = `${progress}%`;
    }

    // Displays the final results
    function showResults() {
        showScreen(resultsScreen);
        scoreText.textContent = `You scored ${score} out of ${quizQuestions.length} correct!`;

        // Provide feedback based on score
        let feedback = '';
        const percentage = (score / quizQuestions.length) * 100;
        if (percentage === 100) {
            feedback = "Amazing! You're a true quiz master!";
        } else if (percentage >= 70) {
            feedback = "Great job! You know your stuff.";
        } else if (percentage >= 40) {
            feedback = "Good effort! Keep practicing.";
        } else {
            feedback = "Don't worry, every expert was once a beginner. Try again!";
        }
        feedbackText.textContent = feedback;
    }

    // Resets the quiz to the start
    function restartQuiz() {
        showScreen(startScreen);
        currentQuestionIndex = 0;
        score = 0;
        progressBarFill.style.width = '0%'; // Reset progress bar visually
    }

    // 5. Event Listeners
    startQuizBtn.addEventListener('click', startQuiz);
    restartQuizBtn.addEventListener('click', restartQuiz);

    // Initial load: show the start screen
    showScreen(startScreen);
});