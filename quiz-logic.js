// Quiz Logic JavaScript File

let currentSection = null;
let currentQuestionIndex = 0;
let currentRound = 1;
let correctAnswersInRound = 0;
let allQuestions = [];
let questionsForRound = [];
let userAnswers = [];
let answered = false;

// Question Banks - Replace these with actual JSON imports
const questionBanks = {
    1: [], // Molecular & Cell Biology
    2: [], // Cell Cycle & Genetics
    3: [], // Comparative Anatomy
    4: []  // Parasitology
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestionBanks();
});

// Load question banks from JSON files
async function loadQuestionBanks() {
    try {
        // Load questions.js (Section 1)
        const response1 = await fetch('questions.js');
        const text1 = await response1.text();
        // Extract array from questions.js format
        eval(text1);
        if (typeof questionsBank !== 'undefined' && questionsBank[1]) {
            questionBanks[1] = questionsBank[1];
        }

        // Load quiz2.json (Section 2)
        const response2 = await fetch('quiz2.json');
        questionBanks[2] = await response2.json();

        // Load quiz3.json (Section 3)
        const response3 = await fetch('quiz3.json');
        questionBanks[3] = await response3.json();

        // Load quiz4.json (Section 4)
        const response4 = await fetch('quiz4.json');
        questionBanks[4] = await response4.json();

        console.log('All question banks loaded successfully');
    } catch (error) {
        console.error('Error loading question banks:', error);
        // Fallback: use sample questions if files not available
        loadSampleQuestions();
    }
}

// Load sample questions if JSON files unavailable
function loadSampleQuestions() {
    questionBanks[1] = [
        {
            q: "Sample Q1: What is the major component of DNA?",
            o: ["histones", "deoxyribonucleotides", "proteins", "amino acids"],
            a: 1
        },
        {
            q: "Sample Q2: Purine bases are?",
            o: ["A + T", "C + T", "A + G", "G + T"],
            a: 2
        }
    ];
}

// Start Quiz
function startQuiz(section) {
    currentSection = section;
    currentQuestionIndex = 0;
    currentRound = 1;
    correctAnswersInRound = 0;
    userAnswers = [];
    answered = false;

    // Get questions from the selected section
    allQuestions = questionBanks[section] || [];

    if (allQuestions.length === 0) {
        alert('No questions available for this section');
        return;
    }

    // Select 10 random questions
    selectRandomQuestions(10);

    // Update UI
    document.getElementById('sectionsView').style.display = 'none';
    document.getElementById('quizView').classList.add('show');
    document.getElementById('resultsView').classList.remove('show');
    document.querySelector('.back-button').classList.add('show');

    // Set section title
    const titles = {
        1: 'Molecular & Cell Biology',
        2: 'Cell Cycle & Genetics',
        3: 'Comparative Anatomy',
        4: 'Parasitology & Disease'
    };
    document.getElementById('sectionTitle').textContent = titles[section];
    document.getElementById('totalQuestions').textContent = '10';

    loadQuestion();
}

// Select 10 random questions
function selectRandomQuestions(count) {
    questionsForRound = [];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    questionsForRound = shuffled.slice(0, Math.min(count, shuffled.length));
}

// Load current question
function loadQuestion() {
    if (currentQuestionIndex >= questionsForRound.length) {
        showResults();
        return;
    }

    const question = questionsForRound[currentQuestionIndex];
    answered = false;

    // Update progress
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('qNumber').textContent = currentQuestionIndex + 1;
    const progressPercent = ((currentQuestionIndex + 1) / questionsForRound.length) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';

    // Load question text
    const questionKey = question.q || question.question;
    document.getElementById('questionText').textContent = questionKey;

    // Load options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const options = question.o || question.options;
    const correctAnswerIndex = question.a || question.correct_answer;

    // Handle different option formats
    if (Array.isArray(options)) {
        options.forEach((option, index) => {
            const btn = createOptionButton(option, index, correctAnswerIndex);
            optionsContainer.appendChild(btn);
        });
    } else if (typeof options === 'object') {
        Object.values(options).forEach((option, index) => {
            const btn = createOptionButton(option, index, correctAnswerIndex);
            optionsContainer.appendChild(btn);
        });
    }

    // Reset feedback
    document.getElementById('answerFeedback').classList.remove('show');
    document.getElementById('nextBtn').disabled = true;
}

// Create option button
function createOptionButton(text, index, correctIndex) {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = text;
    btn.onclick = () => selectOption(index, correctIndex, btn);
    btn.dataset.index = index;
    return btn;
}

// Select option and show feedback
function selectOption(selectedIndex, correctIndex, buttonElement) {
    if (answered) return;

    answered = true;
    const isCorrect = selectedIndex === correctIndex;

    // Store answer
    userAnswers.push({
        question: questionsForRound[currentQuestionIndex],
        selected: selectedIndex,
        correct: correctIndex,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        correctAnswersInRound++;
    }

    // Disable all options
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');

        if (parseInt(btn.dataset.index) === correctIndex) {
            btn.classList.add('correct');
        } else if (parseInt(btn.dataset.index) === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Show feedback
    showFeedback(isCorrect);

    // Enable next button
    document.getElementById('nextBtn').disabled = false;
}

// Show feedback message
function showFeedback(isCorrect) {
    const feedback = document.getElementById('answerFeedback');
    const icon = document.getElementById('feedbackIcon');
    const text = document.getElementById('feedbackText');

    if (isCorrect) {
        feedback.classList.remove('incorrect');
        feedback.classList.add('correct', 'show');
        icon.textContent = '✓';
        text.textContent = 'Correct Answer!';
    } else {
        feedback.classList.remove('correct');
        feedback.classList.add('incorrect', 'show');
        icon.textContent = '✗';
        text.textContent = 'Incorrect! ';
        
        // Add correct answer hint
        const question = questionsForRound[currentQuestionIndex];
        const options = question.o || question.options;
        const correctIndex = question.a || question.correct_answer;
        if (Array.isArray(options)) {
            text.textContent += `The correct answer is: ${options[correctIndex]}`;
        }
    }
}

// Next question
function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// Show results
function showResults() {
    const percentage = Math.round((correctAnswersInRound / questionsForRound.length) * 100);
    const passed = correctAnswersInRound >= 5; // Pass with 50%

    // Hide quiz view
    document.getElementById('quizView').classList.remove('show');
    document.getElementById('resultsView').classList.add('show');

    // Update results display
    document.getElementById('scoreDisplay').textContent = `${correctAnswersInRound}/10`;
    document.getElementById('correctCount').textContent = correctAnswersInRound;
    document.getElementById('wrongCount').textContent = questionsForRound.length - correctAnswersInRound;
    document.getElementById('accuracy').textContent = percentage + '%';

    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.classList.remove('passed', 'failed');
    scoreDisplay.classList.add(passed ? 'passed' : 'failed');

    // Set message
    const message = document.getElementById('resultMessage');
    if (passed) {
        message.textContent = 'Congratulations! You passed! 🎉';
        if (currentRound === 1) {
            message.textContent += ' Ready for Round 2?';
        }
    } else {
        message.textContent = 'You need to score at least 5/10 to pass. Try again!';
    }

    // Set action buttons
    const actionButtons = document.getElementById('actionButtons');
    actionButtons.innerHTML = '';

    if (passed && currentRound === 1) {
        const btn2 = document.createElement('button');
        btn2.className = 'btn btn-primary';
        btn2.textContent = 'Continue to Round 2';
        btn2.onclick = startRound2;
        actionButtons.appendChild(btn2);
    } else if (passed && currentRound === 2) {
        const btnCongrats = document.createElement('button');
        btnCongrats.className = 'btn btn-primary';
        btnCongrats.textContent = 'All Done! 🏆';
        btnCongrats.onclick = goBack;
        actionButtons.appendChild(btnCongrats);
    }

    const btnRetry = document.createElement('button');
    btnRetry.className = 'btn btn-secondary';
    btnRetry.textContent = 'Try Again';
    btnRetry.onclick = () => startQuiz(currentSection);
    actionButtons.appendChild(btnRetry);

    const btnHome = document.createElement('button');
    btnHome.className = 'btn btn-secondary';
    btnHome.textContent = 'Go to Home';
    btnHome.onclick = goBack;
    actionButtons.appendChild(btnHome);
}

// Start Round 2
function startRound2() {
    currentRound = 2;
    correctAnswersInRound = 0;
    currentQuestionIndex = 0;
    userAnswers = [];
    answered = false;

    // Select new 10 random questions
    selectRandomQuestions(10);

    // Reset UI
    document.getElementById('resultsView').classList.remove('show');
    document.getElementById('quizView').classList.add('show');

    loadQuestion();
}

// Go back to home
function goBack() {
    document.getElementById('sectionsView').style.display = 'grid';
    document.getElementById('quizView').classList.remove('show');
    document.getElementById('resultsView').classList.remove('show');
    document.querySelector('.back-button').classList.remove('show');

    // Reset state
    currentSection = null;
    currentQuestionIndex = 0;
    currentRound = 1;
    correctAnswersInRound = 0;
    userAnswers = [];
    answered = false;
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (document.getElementById('quizView').classList.contains('show')) {
        if (e.key === 'Enter' && !document.getElementById('nextBtn').disabled) {
            nextQuestion();
        }
    }
});

console.log('Quiz Logic Loaded Successfully');
