const API_BASE = window.location.protocol === "file:" ? "http://localhost:4000" : "";
const tokenKey = "hiddenSparkAuthToken";
const userKey = "hiddenSparkUser";

const loadingMessages = [
  "Analysing your strengths...",
  "Identifying hidden talents...",
  "Reading motivation signals...",
  "Building your career roadmap...",
];

const publicProfileMessages = [
  "Scanning your public profiles...",
  "Analysing your GitHub activity...",
  "Reading your LinkedIn presence...",
  "Detecting patterns and interests...",
  "Identifying hidden talents...",
  "Building your personalized report...",
];

const socialPlatforms = [
  { key: "linkedin", name: "LinkedIn", color: "#0A66C2", icon: "linkedin", base: "https://www.linkedin.com/in/" },
  { key: "github", name: "GitHub", color: "#181717", icon: "github", base: "https://github.com/" },
  { key: "snapchat", name: "Snapchat", color: "#FFFC00", icon: "snapchat", base: "https://www.snapchat.com/add/" },
  { key: "instagram", name: "Instagram", color: "#E4405F", icon: "instagram", base: "https://www.instagram.com/" },
  { key: "facebook", name: "Facebook", color: "#1877F2", icon: "facebook", base: "https://www.facebook.com/" },
  { key: "twitter", name: "Twitter / X", color: "#000000", icon: "x", base: "https://x.com/" },
  { key: "reddit", name: "Reddit", color: "#FF4500", icon: "reddit", base: "https://www.reddit.com/user/" },
  { key: "quora", name: "Quora", color: "#B92B27", icon: "quora", base: "https://www.quora.com/profile/" },
  { key: "youtube", name: "YouTube", color: "#FF0000", icon: "youtube", base: "https://www.youtube.com/@" },
  { key: "chatgpt", name: "ChatGPT", color: "#10A37F", icon: "openai", base: "https://chatgpt.com/" },
  { key: "claude", name: "Claude", color: "#D97757", icon: "claude", base: "https://claude.ai/" },
  { key: "gemini", name: "Gemini", color: "#4285F4", icon: "googlegemini", base: "https://gemini.google.com/" },
];

const emptySocials = Object.fromEntries(socialPlatforms.map((platform) => [platform.key, ""]));

const questions = [
  {
    id: 1,
    section: 1,
    type: "radio",
    text: "During a group activity, what role do you naturally take?",
    options: [
      { letter: "A", text: "I organize tasks and guide others" },
      { letter: "B", text: "I come up with creative ideas" },
      { letter: "C", text: "I quietly complete important work" },
      { letter: "D", text: "I motivate and encourage the team" },
      { letter: "E", text: "I solve technical or logical problems" },
      { letter: "F", text: "I observe and help wherever needed" },
      { letter: "G", text: "I present the final work confidently" },
    ],
  },
  {
    id: 2,
    section: 1,
    type: "radio",
    text: "Which activity sounds most enjoyable to you during free time?",
    options: [
      { letter: "A", text: "Solving puzzles or strategy games" },
      { letter: "B", text: "Drawing, designing, or creating things" },
      { letter: "C", text: "Playing sports or physical activities" },
      { letter: "D", text: "Reading or learning new facts" },
      { letter: "E", text: "Helping friends with problems" },
      { letter: "F", text: "Making videos, music, or content" },
      { letter: "G", text: "Repairing or building something" },
    ],
  },
  {
    id: 3,
    section: 1,
    type: "radio",
    text: "If your school is organizing an event, what would you most likely volunteer for?",
    options: [
      { letter: "A", text: "Managing the entire event" },
      { letter: "B", text: "Designing posters or decorations" },
      { letter: "C", text: "Hosting or speaking on stage" },
      { letter: "D", text: "Handling accounts or schedules" },
      { letter: "E", text: "Taking photos/videos" },
      { letter: "F", text: "Coordinating with people" },
      { letter: "G", text: "Setting up equipment or technology" },
    ],
  },
  {
    id: 4,
    section: 1,
    type: "radio",
    text: "When you face a difficult problem, what do you usually do first?",
    options: [
      { letter: "A", text: "Break it into smaller steps" },
      { letter: "B", text: "Ask others and discuss ideas" },
      { letter: "C", text: "Try different creative methods" },
      { letter: "D", text: "Stay calm and keep trying alone" },
      { letter: "E", text: "Search for facts or information" },
      { letter: "F", text: "Use practical experience" },
      { letter: "G", text: "Avoid it until necessary" },
    ],
  },
  {
    id: 5,
    section: 1,
    type: "radio",
    text: "Which compliment do you receive most often?",
    options: [
      { letter: "A", text: "You explain things very well." },
      { letter: "B", text: "You are very creative." },
      { letter: "C", text: "You are responsible." },
      { letter: "D", text: "You are confident." },
      { letter: "E", text: "You are smart with technology." },
      { letter: "F", text: "You are very supportive." },
      { letter: "G", text: "You learn things quickly." },
    ],
  },
  {
    id: 6,
    section: 1,
    type: "radio",
    text: "What type of school task do you complete fastest?",
    options: [
      { letter: "A", text: "Writing or speaking assignments" },
      { letter: "B", text: "Mathematical or logical problems" },
      { letter: "C", text: "Art, craft, or design work" },
      { letter: "D", text: "Team projects" },
      { letter: "E", text: "Research-based assignments" },
      { letter: "F", text: "Practical/lab activities" },
      { letter: "G", text: "Sports or performance tasks" },
    ],
  },
  {
    id: 7,
    section: 1,
    type: "radio",
    text: "In a new environment, what do you notice first?",
    options: [
      { letter: "A", text: "People and their behavior" },
      { letter: "B", text: "Rules and organization" },
      { letter: "C", text: "Creative details and design" },
      { letter: "D", text: "Opportunities to participate" },
      { letter: "E", text: "Problems that can be improved" },
      { letter: "F", text: "Technology or tools available" },
      { letter: "G", text: "Overall atmosphere and energy" },
    ],
  },
  {
    id: 8,
    section: 1,
    type: "radio",
    text: "If your friend needs help, what are you most likely to do?",
    options: [
      { letter: "A", text: "Give emotional support" },
      { letter: "B", text: "Suggest practical solutions" },
      { letter: "C", text: "Teach them how to solve it" },
      { letter: "D", text: "Take leadership and handle it" },
      { letter: "E", text: "Cheer them up creatively" },
      { letter: "F", text: "Find information or resources" },
      { letter: "G", text: "Stay with them quietly" },
    ],
  },
  {
    id: 9,
    section: 1,
    type: "radio",
    text: "Which situation makes you feel most confident?",
    options: [
      { letter: "A", text: "Speaking in front of people" },
      { letter: "B", text: "Solving a difficult challenge" },
      { letter: "C", text: "Creating something unique" },
      { letter: "D", text: "Leading a team" },
      { letter: "E", text: "Helping others succeed" },
      { letter: "F", text: "Competing in activities or sports" },
      { letter: "G", text: "Working with machines/computers" },
    ],
  },
  {
    id: 10,
    section: 1,
    type: "radio",
    text: "If you had one full day without restrictions, what would you choose to do?",
    options: [
      { letter: "A", text: "Start a small project or business idea" },
      { letter: "B", text: "Create art, music, or content" },
      { letter: "C", text: "Play games, sports, or outdoor activities" },
      { letter: "D", text: "Learn a new skill online" },
      { letter: "E", text: "Spend time helping or guiding others" },
      { letter: "F", text: "Experiment with gadgets or technology" },
      { letter: "G", text: "Plan and organize future goals" },
    ],
  },
  { id: 11, section: 2, type: "slider", text: "How confident do you feel while using this skill/talent compared to others your age?", min: 1, max: 10 },
  { id: 12, section: 2, type: "radio", text: "How often do you voluntarily engage in activities related to this skill without being forced or graded?", options: ["Rarely", "Sometimes", "Often", "Almost Daily"] },
  { id: 13, section: 2, type: "radio", text: "How quickly do you improve when practicing this skill?", options: ["Very Slowly", "Slowly", "Average", "Fast", "Extremely Fast"] },
  { id: 14, section: 2, type: "radio", text: "How do people usually react when you demonstrate this skill?", options: ["They rarely notice", "They appreciate it occasionally", "They often compliment me", "They actively seek my help", "They consider me exceptionally good at it"] },
  { id: 15, section: 2, type: "slider", text: "How well can you perform this skill under pressure, deadlines, or competition?", min: 1, max: 10 },
  { id: 16, section: 2, type: "radio", text: "How much time can you continuously spend on activities involving this talent before feeling mentally tired?", options: ["Less than 15 minutes", "15-30 minutes", "30-60 minutes", "1-2 hours", "More than 2 hours"] },
  { id: 17, section: 2, type: "radio", text: "How often do you independently try to improve this skill through practice, courses, videos, books, or experimentation?", options: ["Never", "Rarely", "Sometimes", "Frequently", "Very Frequently"] },
  { id: 18, section: 2, type: "slider", text: "Compared to your other skills, how naturally easy does this one feel to you?", min: 1, max: 10 },
  { id: 19, section: 2, type: "textarea", text: "Have you ever achieved measurable results using this talent? Examples: awards, leadership roles, successful projects, appreciation, followers, improved team performance, solving real problems, etc." },
  { id: 20, section: 2, type: "textarea", text: "If you had to rely on only this skill to build your future career or reputation, how confident would you feel? Why?" },
  { id: 21, section: 3, type: "checkbox", text: "Which types of activities excite you the most, even when they are challenging?", options: ["Building or creating things", "Solving logical problems", "Helping or guiding people", "Performing or communicating", "Designing or imagining ideas", "Managing or leading teams", "Researching and discovering new information", "Working with technology", "Working outdoors or physically"] },
  { id: 22, section: 3, type: "textarea", text: "If you could spend an entire day doing only one kind of work, what would you choose and why?" },
  { id: 23, section: 3, type: "textarea", text: "Which school subjects or learning experiences do you naturally enjoy the most? And which ones feel draining?" },
  { id: 24, section: 3, type: "checkbox", text: "What type of problems would you love solving in the real world?", options: ["Environmental issues", "Business problems", "Human emotions and mental health", "Technology and innovation", "Education", "Healthcare", "Entertainment/media", "Social inequality", "Scientific discovery"] },
  { id: 25, section: 3, type: "radio", text: "What kind of work environment do you imagine yourself enjoying the most?", options: ["Fast-paced and competitive", "Creative and flexible", "Structured and organized", "Independent and quiet", "Team-oriented and social", "Fieldwork/adventure-based", "Research-focused"] },
  { id: 26, section: 3, type: "radio", text: "Which of these achievements would make you feel most fulfilled?", options: ["Inventing something impactful", "Leading a successful company/team", "Helping thousands of people", "Becoming famous or influential", "Solving difficult scientific/technical problems", "Creating art/content loved by people", "Teaching or inspiring others"] },
  { id: 27, section: 3, type: "textarea", text: "Who do you admire the most and why?" },
  { id: 28, section: 3, type: "radio", text: "Would you rather:", options: ["Create new ideas", "Improve existing systems", "Work with people directly", "Work with machines/data/technology", "Analyze information deeply", "Take action and execute quickly"] },
  { id: 29, section: 3, type: "textarea", text: "Imagine you are guaranteed success in any field. What career would you choose without hesitation?" },
  { id: 30, section: 3, type: "ranking", text: "What matters most to you in your future career? Drag to rank these from highest to lowest priority.", options: ["Money", "Creativity", "Stability", "Freedom/Flexibility", "Social Impact", "Recognition/Fame", "Innovation", "Work-Life Balance", "Leadership Opportunities"] },
];

const state = {
  user: JSON.parse(localStorage.getItem(userKey) || "null"),
  resetPhone: "",
  resetToken: "",
  currentIndex: 0,
  answers: {},
  report: null,
  socials: { ...emptySocials },
  socialsSaved: false,
  section1TalentTag: "",
  saveTimer: null,
  loadingTimer: null,
};

const authShell = document.querySelector("#authShell");
const appShell = document.querySelector("#appShell");
const socialShell = document.querySelector("#socialShell");
const choiceShell = document.querySelector("#choiceShell");
const quizShell = document.querySelector("#quizShell");
const reportShell = document.querySelector("#reportShell");
const questionMount = document.querySelector("#questionMount");
const nextButton = document.querySelector("#nextQuestion");
const backButton = document.querySelector("#backQuestion");

function token() {
  return localStorage.getItem(tokenKey);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) logout();
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

function showAuthView(name) {
  document.querySelectorAll(".auth-view").forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.authView === name));
  clearMessages();
}

function clearMessages() {
  document.querySelectorAll(".form-message, .error").forEach((item) => (item.textContent = ""));
}

function setMessage(id, message, type = "neutral") {
  const item = document.querySelector(`#${id}`);
  if (!item) return;
  item.textContent = message;
  item.className = `form-message ${type}`;
}

function setFieldError(id, message) {
  const error = document.querySelector(`[data-error-for="${id}"]`);
  if (error) error.textContent = message;
}

function setLoading(form, loading) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  button.dataset.originalText ||= button.textContent;
  button.textContent = loading ? "Please wait..." : button.dataset.originalText;
  button.disabled = loading;
}

function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isStrongPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function optionValue(option) {
  return typeof option === "object" ? option.letter : option;
}

function optionText(option) {
  return typeof option === "object" ? option.text : option;
}

function normalizeStoredAnswer(question, answer) {
  if (question?.section === 1 && question.type === "radio") {
    return /^[A-G]$/.test(String(answer || "")) ? answer : "";
  }
  return answer;
}

function scoreOutOfTen(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return number > 10 ? Math.round(number / 10) : number;
}

function scorePercent(value) {
  return Math.min(100, Math.max(0, scoreOutOfTen(value) * 10));
}

function logout() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  authShell.classList.remove("hidden");
  appShell.classList.add("hidden");
  showAuthView("login");
}

function loginSession(data) {
  localStorage.setItem(tokenKey, data.token);
  localStorage.setItem(userKey, JSON.stringify(data.user));
  state.user = data.user;
  bootApp();
}

async function bootApp() {
  authShell.classList.add("hidden");
  appShell.classList.remove("hidden");
  document.querySelector("#navUserName").textContent = state.user?.name || "Student";

  const data = await request("/api/talent/state");
  state.user = data.user;
  state.answers = Object.fromEntries(
    data.answers.map((item) => {
      const question = questions.find((candidate) => candidate.id === item.question_number);
      return [item.question_number, normalizeStoredAnswer(question, item.answer)];
    }),
  );
  state.report = data.report;
  state.socialsSaved = Boolean(data.socials);
  state.socials = { ...emptySocials, ...(data.socials || {}) };
  state.section1TalentTag = data.quizRecord?.section1_talent_tag || "";
  localStorage.setItem(userKey, JSON.stringify(data.user));
  document.querySelector("#navUserName").textContent = data.user.name;

  if (!state.socialsSaved) {
    renderSocials();
    return;
  }

  if (state.report) {
    renderReport(state.report);
    return;
  }

  if (Object.keys(state.answers).length) {
    startQuestionnaire();
    return;
  }

  renderChoice();
}

function markFlow(flow) {
  document.querySelectorAll(".flow-stepper span").forEach((step) => step.classList.toggle("active", step.dataset.flow === String(flow)));
}

function renderSocials() {
  socialShell.classList.remove("hidden");
  choiceShell.classList.add("hidden");
  quizShell.classList.add("hidden");
  reportShell.classList.add("hidden");
  markFlow("social");
  document.querySelector("#socialList").innerHTML = socialPlatforms.map((platform) => `
    <article class="social-row" style="--brand:${platform.color}">
      <img src="https://cdn.simpleicons.org/${platform.icon}/${platform.color.replace("#", "")}" alt="${platform.name}" />
      <label for="social-${platform.key}">${platform.name}</label>
      <input id="social-${platform.key}" name="${platform.key}" type="text" placeholder="URL or username" value="${escapeHtml(state.socials[platform.key] || "")}" />
      <button class="visit-button" type="button" data-visit="${platform.key}" aria-label="Visit ${platform.name} link">&#8599;</button>
      <span class="social-error" data-social-error="${platform.key}"></span>
    </article>
  `).join("");
  updateSocialCompletion();
}

function continueAfterSocials() {
  renderChoice();
}

function renderChoice() {
  socialShell.classList.add("hidden");
  choiceShell.classList.remove("hidden");
  quizShell.classList.add("hidden");
  reportShell.classList.add("hidden");
  markFlow("social");
}

function startQuestionnaire() {
  socialShell.classList.add("hidden");
  choiceShell.classList.add("hidden");
  reportShell.classList.add("hidden");
  state.currentIndex = questions.findIndex((question) => !isAnswerFilled(state.answers[question.id]));
  if (state.currentIndex === -1) state.currentIndex = 0;
  renderQuestion();
}

function collectSocials() {
  return Object.fromEntries(socialPlatforms.map((platform) => {
    const input = document.querySelector(`#social-${platform.key}`);
    return [platform.key, input ? input.value.trim() : ""];
  }));
}

function isSocialEntryValid(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".");
    } catch {
      return false;
    }
  }
  return !/\s/.test(text) && text.length <= 120;
}

function validateSocials(values) {
  const errors = {};
  socialPlatforms.forEach((platform) => {
    if (!isSocialEntryValid(values[platform.key])) errors[platform.key] = "Enter a valid URL or username.";
  });
  return errors;
}

function showSocialErrors(errors) {
  document.querySelectorAll(".social-error").forEach((item) => (item.textContent = ""));
  Object.entries(errors).forEach(([key, message]) => {
    const item = document.querySelector(`[data-social-error="${key}"]`);
    if (item) item.textContent = message;
  });
}

function updateSocialCompletion() {
  const values = collectSocials();
  const filled = socialPlatforms.filter((platform) => values[platform.key]).length;
  const percent = Math.round((filled / socialPlatforms.length) * 100);
  document.querySelector("#socialPercent").textContent = `${percent}%`;
  document.querySelector("#socialProgress").style.width = `${percent}%`;
}

function socialUrl(platform, value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `${platform.base}${encodeURIComponent(text.replace(/^@/, ""))}`;
}

function sectionTitle(section) {
  if (section === 1) return "Let's Discover Your Hidden Talents";
  if (section === 2) return "How Strong Are Your Skills?";
  return "What Does Your Future Look Like?";
}

function renderQuestion() {
  socialShell.classList.add("hidden");
  choiceShell.classList.add("hidden");
  quizShell.classList.remove("hidden");
  reportShell.classList.add("hidden");

  const question = questions[state.currentIndex];
  const localNumber = ((question.id - 1) % 10) + 1;
  document.querySelector("#sectionMeta").textContent = `Section ${question.section} of 3 \u2014 Question ${localNumber} of 10`;
  document.querySelector("#sectionTitle").textContent = sectionTitle(question.section);
  document.querySelector("#quizProgress").style.width = `${(localNumber / 10) * 100}%`;
  markFlow(question.section);
  backButton.disabled = state.currentIndex === 0;
  nextButton.textContent = getNextButtonLabel(question);
  questionMount.innerHTML = `<article class="question-card-inner"><span class="question-number">Q${question.id}</span><h3>${question.text}</h3>${renderInput(question)}</article>`;
  wireRanking(question);
  updateNextState();
}

function getNextButtonLabel(question) {
  if (question.id === 10) return "Continue to Section 2";
  if (question.id === 20) return "Continue to Section 3";
  if (question.id === 30) return "Generate My Talent Report";
  return "Next";
}

function renderInput(question) {
  const value = state.answers[question.id];
  if (question.type === "textarea") return `<textarea name="answer" rows="5" minlength="2" placeholder="Write your answer here...">${escapeHtml(value || "")}</textarea>`;
  if (question.type === "text") return `<input name="answer" type="text" placeholder="Short answer" value="${escapeHtml(value || "")}" />`;
  if (question.type === "checkbox") {
    const values = Array.isArray(value) ? value : [];
    return `<div class="option-grid">${question.options.map((option) => `<label class="option-card"><input type="checkbox" name="answer" value="${escapeHtml(option)}" ${values.includes(option) ? "checked" : ""} /><span>${option}</span></label>`).join("")}</div>`;
  }
  if (question.type === "radio") {
    const isSectionOne = question.section === 1;
    return `<div class="option-grid ${isSectionOne ? "section-one-options" : ""}">${question.options.map((option) => {
      const valueText = optionValue(option);
      const labelText = optionText(option);
      return `<label class="option-card ${isSectionOne ? "letter-option-card" : ""}">
        <input type="radio" name="answer" value="${escapeHtml(valueText)}" ${value === valueText ? "checked" : ""} />
        ${isSectionOne ? `<span class="option-letter">${escapeHtml(valueText)}</span>` : ""}
        <span>${escapeHtml(labelText)}</span>
      </label>`;
    }).join("")}</div>`;
  }
  if (question.type === "slider") {
    const sliderValue = value || 5;
    return `<div class="slider-wrap"><input name="answer" type="range" min="${question.min}" max="${question.max}" value="${sliderValue}" /><strong id="sliderValue">${sliderValue}</strong></div>`;
  }
  const ranking = Array.isArray(value) && value.length === question.options.length ? value : question.options;
  return `<ol class="ranking-list" id="rankingList">${ranking.map((item, index) => `<li draggable="true" data-value="${escapeHtml(item)}"><span>${index + 1}</span><strong>${item}</strong><button type="button" data-move="up">Up</button><button type="button" data-move="down">Down</button></li>`).join("")}</ol>`;
}

function collectAnswer() {
  const question = questions[state.currentIndex];
  if (question.type === "checkbox") return [...questionMount.querySelectorAll('input[name="answer"]:checked')].map((input) => input.value);
  if (question.type === "radio") return questionMount.querySelector('input[name="answer"]:checked')?.value || "";
  if (question.type === "ranking") return [...questionMount.querySelectorAll("#rankingList li")].map((item) => item.dataset.value);
  return questionMount.querySelector('[name="answer"]')?.value || "";
}

function isAnswerFilled(answer) {
  if (Array.isArray(answer)) return answer.length > 0;
  return String(answer || "").trim().length > 0;
}

function updateNextState() {
  const answer = collectAnswer();
  nextButton.disabled = !isAnswerFilled(answer);
  if (questions[state.currentIndex].type === "slider") {
    document.querySelector("#sliderValue").textContent = answer;
  }
}

function scheduleAutosave() {
  window.clearTimeout(state.saveTimer);
  state.saveTimer = window.setTimeout(() => saveCurrentAnswer(false), 650);
}

async function saveCurrentAnswer(showSaved = true) {
  const question = questions[state.currentIndex];
  const answer = collectAnswer();
  if (!isAnswerFilled(answer)) return;
  state.answers[question.id] = answer;
  document.querySelector("#autosaveStatus").textContent = "Saving...";
  const data = await request("/api/talent/answer", {
    method: "POST",
    body: JSON.stringify({ section: question.section, question_number: question.id, answer }),
  });
  state.section1TalentTag = data.quizRecord?.section1_talent_tag || state.section1TalentTag;
  document.querySelector("#autosaveStatus").textContent = showSaved ? "Saved. You can continue." : "Autosaved.";
}

function wireRanking(question) {
  if (question.type !== "ranking") return;
  const list = document.querySelector("#rankingList");
  let dragged = null;

  list.addEventListener("dragstart", (event) => {
    dragged = event.target.closest("li");
    event.dataTransfer.effectAllowed = "move";
  });
  list.addEventListener("dragover", (event) => {
    event.preventDefault();
    const target = event.target.closest("li");
    if (!target || target === dragged) return;
    const before = target.getBoundingClientRect().top + target.offsetHeight / 2 > event.clientY;
    list.insertBefore(dragged, before ? target : target.nextSibling);
  });
  list.addEventListener("drop", () => {
    renumberRanking();
    updateNextState();
    scheduleAutosave();
  });
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-move]");
    if (!button) return;
    const item = button.closest("li");
    if (button.dataset.move === "up" && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
    if (button.dataset.move === "down" && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
    renumberRanking();
    updateNextState();
    scheduleAutosave();
  });
}

function renumberRanking() {
  document.querySelectorAll("#rankingList li span").forEach((span, index) => {
    span.textContent = index + 1;
  });
}

function showGenerationOverlay(show, messages = loadingMessages, intervalMs = 1400) {
  const overlay = document.querySelector("#loadingOverlay");
  const progress = document.querySelector("#loadingProgress");
  overlay.classList.toggle("hidden", !show);
  window.clearInterval(state.loadingTimer);
  if (progress) progress.style.width = "0%";
  if (!show) return;
  let index = 0;
  document.querySelector("#loadingMessage").textContent = messages[index];
  if (progress) progress.style.width = `${100 / messages.length}%`;
  state.loadingTimer = window.setInterval(() => {
    index = Math.min(index + 1, messages.length - 1);
    document.querySelector("#loadingMessage").textContent = messages[index];
    if (progress) progress.style.width = `${((index + 1) / messages.length) * 100}%`;
  }, intervalMs);
}

async function generateReport() {
  showGenerationOverlay(true);
  try {
    const data = await request("/api/talent/analyse", { method: "POST", body: "{}" });
    state.report = data.report;
    renderReport(data.report);
  } finally {
    showGenerationOverlay(false);
  }
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function generatePublicDataReport() {
  showGenerationOverlay(true, publicProfileMessages, 1800);
  try {
    const [data] = await Promise.all([
      request("/api/talent/public-report", { method: "POST", body: "{}" }),
      delay(10800),
    ]);
    state.report = data.report;
    renderReport(data.report);
  } finally {
    showGenerationOverlay(false);
  }
}

function renderReport(report) {
  socialShell.classList.add("hidden");
  choiceShell.classList.add("hidden");
  quizShell.classList.add("hidden");
  reportShell.classList.remove("hidden");
  markFlow("report");
  const skills = Object.entries(report.skill_strength_scores || {}).slice(0, 5);
  const roadmap = String(report.career_roadmap || "").split("|").map((item) => item.trim()).filter(Boolean);
  const publicDataBanner = report.report_type === "public_data" ? `
    <aside class="report-warning">
      <p><strong>Limited data report</strong><span>This report is based on limited public data. Take the full assessment for a deeper and more accurate analysis.</span></p>
      <button class="secondary-button" id="takeFullAssessment" type="button">Take Full Assessment</button>
    </aside>
  ` : "";

  document.querySelector("#reportMount").innerHTML = `
    ${publicDataBanner}
    <header class="report-header">
      <div><p class="eyebrow">AI talent report</p><h2>${escapeHtml(state.user?.name || "Your")} Hidden Talent Profile</h2></div>
      <div class="report-actions"><button class="secondary-button" id="downloadReport" type="button">Download Report as PDF</button><button class="ghost-button" id="retakeAssessment" type="button">Retake Assessment</button></div>
    </header>

    <section class="report-section">
      <p class="section-label">Section A - Who You Are</p>
      <div class="tag-cloud">${(report.personality_traits || []).map((trait) => `<span>${escapeHtml(trait)}</span>`).join("")}</div>
      <div class="report-grid two">
        <article class="report-card"><h3>Learning Style</h3><p>${escapeHtml(report.learning_style || "")}</p></article>
        <article class="report-card"><h3>Top 5 Strongest Skills</h3>${skills.map(([skill, score]) => `<div class="skill-bar"><span>${escapeHtml(skill)}</span><div><i style="width:${scorePercent(score)}%"></i></div><strong>${scoreOutOfTen(score)}/10</strong></div>`).join("")}</article>
      </div>
    </section>

    <section class="report-section">
      <p class="section-label">Section B - Your Hidden Talents</p>
      <div class="talent-grid">${(report.hidden_talents || []).map((talent) => `<article><strong>${escapeHtml(talent)}</strong></article>`).join("")}</div>
      <article class="callout"><span>Most underrated talent</span><strong>${escapeHtml(report.most_underrated_talent || "")}</strong></article>
      <ul class="action-list">${(report.unrealized_potential || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>

    <section class="report-section">
      <p class="section-label">Section C - Leadership & Creativity</p>
      <div class="report-grid three">
        <article class="metric-card"><div class="ring" style="--score:${scorePercent(report.leadership_potential?.score)}"><strong>${scoreOutOfTen(report.leadership_potential?.score)}</strong></div><h3>Leadership Potential</h3><p>${escapeHtml(report.leadership_potential?.analysis || "")}</p></article>
        <article class="report-card"><h3>Creativity & Innovation</h3><p>${escapeHtml(report.creativity_analysis || "")}</p></article>
        <article class="metric-card"><div class="gauge"><i style="width:${scorePercent(report.entrepreneurial_potential_score)}%"></i></div><h3>Entrepreneurial Potential</h3><strong>${scoreOutOfTen(report.entrepreneurial_potential_score)}/10</strong></article>
      </div>
      <article class="report-card"><h3>Communication & Emotional Intelligence</h3><p>${escapeHtml(report.communication_eq_analysis || "")}</p></article>
    </section>

    <section class="report-section">
      <p class="section-label">Section D - Your Career Path</p>
      <div class="career-grid">${(report.best_career_paths || []).slice(0, 3).map((career) => `<article><span>Path</span><strong>${escapeHtml(career)}</strong></article>`).join("")}</div>
      <div class="future-grid">${(report.emerging_careers || []).map((career) => `<article>${escapeHtml(career)}</article>`).join("")}</div>
      <div class="timeline">${roadmap.map((item) => `<div><span></span><p>${escapeHtml(item)}</p></div>`).join("")}</div>
    </section>

    <section class="report-section">
      <p class="section-label">Section E - Grow Further</p>
      <ul class="action-list">${(report.skill_improvements || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <article class="summary-box"><h3>Final Summary of Student Potential</h3><p>${escapeHtml(report.final_summary || "")}</p></article>
    </section>
  `;

  document.querySelector("#downloadReport").addEventListener("click", () => window.print());
  document.querySelector("#retakeAssessment").addEventListener("click", retakeAssessment);
  document.querySelector("#takeFullAssessment")?.addEventListener("click", startQuestionnaire);
}

async function retakeAssessment() {
  await request("/api/talent/retake", { method: "POST", body: "{}" });
  state.answers = {};
  state.report = null;
  state.currentIndex = 0;
  renderQuestion();
}

questionMount.addEventListener("input", () => {
  updateNextState();
  scheduleAutosave();
});
questionMount.addEventListener("change", () => {
  updateNextState();
  scheduleAutosave();
});

document.querySelector("#talentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveCurrentAnswer(true);
  if (state.currentIndex === questions.length - 1) {
    await generateReport();
    return;
  }
  state.currentIndex += 1;
  renderQuestion();
});

backButton.addEventListener("click", () => {
  state.currentIndex = Math.max(0, state.currentIndex - 1);
  renderQuestion();
});

document.querySelector("#socialList").addEventListener("input", () => {
  updateSocialCompletion();
  showSocialErrors({});
  document.querySelector("#socialMessage").textContent = "";
});

document.querySelector("#socialList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-visit]");
  if (!button) return;
  const platform = socialPlatforms.find((item) => item.key === button.dataset.visit);
  const value = document.querySelector(`#social-${platform.key}`).value.trim();
  const errors = validateSocials({ ...emptySocials, [platform.key]: value });
  showSocialErrors(errors);
  if (!value) {
    document.querySelector(`[data-social-error="${platform.key}"]`).textContent = "Add a URL or username first.";
    return;
  }
  if (Object.keys(errors).length) return;
  window.open(socialUrl(platform, value), "_blank", "noopener");
});

document.querySelector("#socialForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = collectSocials();
  const errors = validateSocials(values);
  showSocialErrors(errors);
  if (Object.keys(errors).length) {
    document.querySelector("#socialMessage").textContent = "Please fix the highlighted links.";
    return;
  }
  setLoading(event.currentTarget, true);
  try {
    const data = await request("/api/socials", { method: "POST", body: JSON.stringify(values) });
    state.socials = { ...emptySocials, ...data.socials };
    state.socialsSaved = true;
    continueAfterSocials();
  } catch (error) {
    document.querySelector("#socialMessage").textContent = error.message;
  } finally {
    setLoading(event.currentTarget, false);
  }
});

document.querySelector("#editSocialsButton").addEventListener("click", () => renderSocials());
document.querySelector("#startQuestionnaire").addEventListener("click", startQuestionnaire);
document.querySelector("#generatePublicReport").addEventListener("click", generatePublicDataReport);

document.querySelectorAll("[data-auth-view]").forEach((button) => button.addEventListener("click", () => showAuthView(button.dataset.authView)));
document.querySelectorAll("[data-toggle]").forEach((button) => button.addEventListener("click", () => {
  const input = document.querySelector(`#${button.dataset.toggle}`);
  input.type = input.type === "password" ? "text" : "password";
  button.textContent = input.type === "password" ? "Show" : "Hide";
}));

document.querySelector("#signupForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();
  const values = getFormData(event.currentTarget);
  if (!values.name.trim()) return setFieldError("signupName", "Enter your full name.");
  if (!Number(values.age)) return setFieldError("signupAge", "Enter a valid age.");
  if (!/^\d{10}$/.test(normalizePhone(values.phone))) return setFieldError("signupPhone", "Phone must be 10 digits.");
  if (!isEmail(values.email)) return setFieldError("signupEmail", "Enter a valid email.");
  if (!isStrongPassword(values.password)) return setFieldError("signupPassword", "Use 8+ chars with uppercase, lowercase, number, and symbol.");
  if (values.password !== values.confirmPassword) return setFieldError("signupConfirmPassword", "Passwords do not match.");
  setLoading(event.currentTarget, true);
  try {
    await request("/api/auth/signup", { method: "POST", body: JSON.stringify({ ...values, phone: normalizePhone(values.phone) }) });
    event.currentTarget.reset();
    showAuthView("login");
    setMessage("loginMessage", "Account created. Please log in.", "success");
  } catch (error) {
    setMessage("signupMessage", error.message, "error");
  } finally {
    setLoading(event.currentTarget, false);
  }
});

document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();
  const values = getFormData(event.currentTarget);
  if (!isEmail(values.email)) return setFieldError("loginEmail", "Enter a valid email.");
  if (!values.password) return setFieldError("loginPassword", "Enter your password.");
  setLoading(event.currentTarget, true);
  try {
    loginSession(await request("/api/auth/login", { method: "POST", body: JSON.stringify(values) }));
  } catch (error) {
    setMessage("loginMessage", error.message, "error");
  } finally {
    setLoading(event.currentTarget, false);
  }
});

document.querySelector("#phoneForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const phone = normalizePhone(document.querySelector("#resetPhone").value);
  if (!/^\d{10}$/.test(phone)) return setFieldError("resetPhone", "Phone must be 10 digits.");
  setLoading(event.currentTarget, true);
  try {
    const data = await request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ phone }) });
    state.resetPhone = phone;
    document.querySelectorAll(".reset-form").forEach((form) => form.classList.remove("active"));
    document.querySelector("#otpForm").classList.add("active");
    setMessage("forgotMessage", `OTP sent. Mock OTP: ${data.devOtp}`, "success");
  } catch (error) {
    setMessage("forgotMessage", error.message, "error");
  } finally {
    setLoading(event.currentTarget, false);
  }
});

document.querySelector("#otpForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading(event.currentTarget, true);
  try {
    const data = await request("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone: state.resetPhone, otp: document.querySelector("#otpCode").value }) });
    state.resetToken = data.resetToken;
    document.querySelectorAll(".reset-form").forEach((form) => form.classList.remove("active"));
    document.querySelector("#resetPasswordForm").classList.add("active");
    setMessage("forgotMessage", "OTP verified.", "success");
  } catch (error) {
    setMessage("forgotMessage", error.message, "error");
  } finally {
    setLoading(event.currentTarget, false);
  }
});

document.querySelector("#resetPasswordForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = getFormData(event.currentTarget);
  if (!isStrongPassword(values.password)) return setFieldError("newPassword", "Use a stronger password.");
  if (values.password !== values.confirmPassword) return setFieldError("confirmNewPassword", "Passwords do not match.");
  setLoading(event.currentTarget, true);
  try {
    await request("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ ...values, phone: state.resetPhone, resetToken: state.resetToken }) });
    showAuthView("login");
    setMessage("loginMessage", "Password reset successful.", "success");
  } catch (error) {
    setMessage("forgotMessage", error.message, "error");
  } finally {
    setLoading(event.currentTarget, false);
  }
});

document.querySelector("#logoutButton").addEventListener("click", logout);

if (token() && state.user) {
  bootApp().catch(logout);
}
