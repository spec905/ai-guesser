//ELEMENTS
const welcomeScreen = document.getElementById("welcomeScreen");
const gameScreen = document.getElementById("gameScreen");
const startGame = document.getElementById("startGame");
const restartBtn = document.getElementById("restartBtn");

const questionInput = document.getElementById("questionInput");
const chat = document.getElementById("chat");
const typing = document.getElementById("typing");

const questionsLeft = document.getElementById("questionsLeft");
const progress = document.getElementById("progress");
const currentCategory = document.getElementById("currentCategory");
const currentDifficulty = document.getElementById("currentDifficulty");

const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");

const guessBtn = document.getElementById("guessBtn");
const hintBtn = document.getElementById("hintBtn");
const sendBtn = document.getElementById("sendBtn");

const guessModal = document.getElementById("guessModal");
const guessInput = document.getElementById("guessInput");
const submitGuess = document.getElementById("submitGuess");
const cancelGuess = document.getElementById("cancelGuess");

const winModal = document.getElementById("winModal");
const loseModal = document.getElementById("loseModal");
const correctAnswer = document.getElementById("correctAnswer");
const winStars = document.getElementById("winStars");
const winPoints = document.getElementById("winPoints");
const winQuestionsUsed = document.getElementById("winQuestionsUsed");

// GAME STATE
const MAX_QUESTIONS = 20;
let remainingQuestions = MAX_QUESTIONS;
let category = "anything";
let difficulty = "easy";
let history = [];
let gameActive = false;

// START GAME
startGame.addEventListener("click", () => {
    category = categorySelect.value;
    difficulty = difficultySelect.value;
    history = [];
    remainingQuestions = MAX_QUESTIONS;
    gameActive = true;

    questionsLeft.textContent = remainingQuestions;
    progress.style.width = "100%";

    currentCategory.textContent = categorySelect.options[categorySelect.selectedIndex].text;
    currentDifficulty.textContent = difficultySelect.options[difficultySelect.selectedIndex].text;

    chat.innerHTML = "";
    addAIMessage("Hello! 👋");
    addAIMessage(`I'm thinking of something in the category: ${currentCategory.textContent}...`);
    addAIMessage("Ask me your first yes/no question!");

    sendBtn.disabled = false;
    questionInput.disabled = false;
    guessBtn.disabled = false;
    hintBtn.disabled = false;

    welcomeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    questionInput.focus();
});

// SEND QUESTION
sendBtn.addEventListener("click", sendQuestion);
questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendQuestion();
});

async function sendQuestion() {
    if (!gameActive) return;
    const question = questionInput.value.trim();
    if (question === "") return;

    addPlayerMessage(question);
    questionInput.value = "";
    setInputsEnabled(false);
    showTyping(true);

    try {
        const data = await callBackend({ type: "question", category, difficulty, history, message: question });
        history.push({ role: "user", content: question });
        history.push({ role: "assistant", content: data.reply });
        addAIMessage(data.reply);
    } catch (err) {
        addAIMessage("⚠️ Something went wrong. Try again.");
        console.error(err);
    }

    showTyping(false);
    remainingQuestions--;
    questionsLeft.textContent = remainingQuestions;
    progress.style.width = (remainingQuestions / MAX_QUESTIONS) * 100 + "%";

    if (remainingQuestions <= 0) endGame(false);
    else setInputsEnabled(true);
}

// HINT
hintBtn.addEventListener("click", async () => {
    if (!gameActive || remainingQuestions <= 2) {
        addAIMessage("⚠️ Not enough questions left for a hint.");
        return;
    }

    setInputsEnabled(false);
    showTyping(true);

    try {
        const data = await callBackend({ type: "hint", category, difficulty, history, message: "" });
        addAIMessage("💡 " + data.reply);
        remainingQuestions -= 2;
        questionsLeft.textContent = remainingQuestions;
        progress.style.width = (remainingQuestions / MAX_QUESTIONS) * 100 + "%";
    } catch (err) {
        addAIMessage("⚠️ Couldn't get hint.");
    }

    showTyping(false);
    if (remainingQuestions <= 0) endGame(false);
    else setInputsEnabled(true);
});

// GUESS
guessBtn.addEventListener("click", () => {
    if (gameActive) guessModal.classList.remove("hidden");
});
cancelGuess.addEventListener("click", () => guessModal.classList.add("hidden"));
submitGuess.addEventListener("click", checkGuess);
guessInput.addEventListener("keydown", (e) => { if (e.key === "Enter") checkGuess(); });

async function checkGuess() {
    const guess = guessInput.value.trim();
    if (!guess) return;

    guessModal.classList.add("hidden");
    guessInput.value = "";
    setInputsEnabled(false);
    showTyping(true);

    try {
        const data = await callBackend({ type: "guess", category, difficulty, history, message: guess });
        if (data.correct) {
            endGame(true);
        } else {
            addAIMessage("❌ Nope, that's not it!");
        }
    } catch (err) {
        addAIMessage("⚠️ Error checking guess.");
    }

    showTyping(false);
    setInputsEnabled(true);
}

// END GAME
async function endGame(won) {
    gameActive = false;
    setInputsEnabled(false);

    if (won) {
        const questionsUsed = MAX_QUESTIONS - remainingQuestions;
        const { stars, points } = scoreFor(questionsUsed);
        winStars.textContent = "⭐".repeat(stars);
        winPoints.textContent = points;
        winQuestionsUsed.textContent = questionsUsed;
        winModal.classList.remove("hidden");
    } else {
        showTyping(true);
        try {
            const data = await callBackend({ type: "reveal", category, difficulty, history, message: "" });
            correctAnswer.textContent = data.revealed || "something mysterious";
        } catch (e) {}
        showTyping(false);
        loseModal.classList.remove("hidden");
    }
}

function scoreFor(questionsUsed) {
    if (questionsUsed <= 5) return { stars: 5, points: 100 };
    if (questionsUsed <= 10) return { stars: 4, points: 80 };
    if (questionsUsed <= 15) return { stars: 3, points: 60 };
    if (questionsUsed <= 19) return { stars: 2, points: 40 };
    return { stars: 1, points: 20 };
}

// PLAY AGAIN
document.querySelectorAll(".playAgain").forEach(btn => {
    btn.addEventListener("click", () => {
        winModal.classList.add("hidden");
        loseModal.classList.add("hidden");
        goHome();
    });
});

restartBtn.addEventListener("click", goHome);

function goHome() {
    gameActive = false;
    welcomeScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
}

// CHAT HELPERS
function addPlayerMessage(text) {
    const msg = document.createElement("div");
    msg.classList.add("message", "player");
    msg.textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function addAIMessage(text) {
    const msg = document.createElement("div");
    msg.classList.add("message", "ai");
    msg.textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function showTyping(show) {
    typing.classList.toggle("hidden", !show);
}

function setInputsEnabled(enabled) {
    sendBtn.disabled = !enabled;
    questionInput.disabled = !enabled;
    guessBtn.disabled = !enabled;
    hintBtn.disabled = !enabled;
}

// ********************DIRECT GROQ CALL ***************
async function callBackend(payload) {
    const systemPrompt = buildSystemPrompt(payload.category, payload.difficulty, payload.type);
    const messages = buildMessages(payload.history, payload.type, payload.message, systemPrompt);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 300,
            temperature: 0.7,
            messages: messages
        })
    });

    if (!res.ok) throw new Error("API Error");

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "I don't know.";

    if (payload.type === "guess") {
        const correct = /^CORRECT/i.test(text);
        return { correct, revealed: correct ? text.replace(/^CORRECT:\s*/i, "") : null };
    }
    if (payload.type === "reveal") {
        return { revealed: text };
    }
    return { reply: text };
}

function buildSystemPrompt(category, difficulty, type) {
    const cat = category === "anything" ? "anything" : category;
    return `You are a 20 Questions game host. The secret is in category: ${cat}. Difficulty: ${difficulty}. Be consistent. Answer shortly.`;
}

function buildMessages(history, type, message, systemPrompt) {
    const msgs = [{ role: "system", content: systemPrompt }];
    history.forEach(h => msgs.push(h));
    
    let userMsg = message;
    if (type === "hint") userMsg = "Give one short hint.";
    if (type === "guess") userMsg = `Is the answer "${message}"? Reply exactly "CORRECT: yes" or "INCORRECT"`;
    if (type === "reveal") userMsg = "Reveal what the thing was.";

    msgs.push({ role: "user", content: userMsg });
    return msgs;
}