const API_BASE = window.location.protocol === "file:" ? "http://localhost:4000" : "";
const tokenKey = "hiddenSparkAuthToken";
const userKey = "hiddenSparkUser";

const loadingMessages = [
  "Analysing your strengths...",
  "Identifying hidden talents...",
  "Reading motivation signals...",
  "Building your career roadmap...",
];

const questions = [
  { id: 1, section: 1, type: "textarea", text: "What activities make you lose track of time completely, even when no one asks you to do them?" },
  { id: 2, section: 1, type: "checkbox", text: "When working in a group, what role do you naturally take most often?", options: ["Leader", "Planner/Organizer", "Problem Solver", "Creative Idea Generator", "Mediator", "Technical Executor", "Presenter/Communicator"] },
  { id: 3, section: 1, type: "textarea", text: "Describe a situation where you solved a problem in a way different from others. What did you do?" },
  { id: 4, section: 1, type: "text", text: "Which type of tasks do people usually come to you for help with?" },
  { id: 5, section: 1, type: "textarea", text: "If marks and money did not matter, what would you spend most of your time learning or building?" },
  { id: 6, section: 1, type: "checkbox", text: "Which of these activities energize you the most? Choose all that apply.", options: ["Designing or drawing", "Coding or building tech", "Explaining concepts to others", "Performing/speaking", "Writing stories or ideas", "Solving puzzles or logic problems", "Organizing events/projects", "Helping people emotionally", "Sports/physical activities", "Researching deeply into topics"] },
  { id: 7, section: 1, type: "textarea", text: "Tell us about something you taught yourself without formal instruction. How did you learn it?" },
  { id: 8, section: 1, type: "checkbox", text: "What kind of challenges excite you the most?", options: ["Competing against others", "Creating something new", "Solving difficult problems", "Helping people", "Leading teams", "Exploring unknown ideas", "Improving systems/processes"] },
  { id: 9, section: 1, type: "textarea", text: "When you fail at something important, what do you usually do next?" },
  { id: 10, section: 1, type: "textarea", text: "Imagine you are given unlimited resources for one year to build, create, solve, or improve something. What would you choose and why?" },
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
  saveTimer: null,
  loadingTimer: null,
};

const authShell = document.querySelector("#authShell");
const appShell = document.querySelector("#appShell");
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
  state.answers = Object.fromEntries(data.answers.map((item) => [item.question_number, item.answer]));
  state.report = data.report;
  localStorage.setItem(userKey, JSON.stringify(data.user));
  document.querySelector("#navUserName").textContent = data.user.name;

  if (state.report) {
    renderReport(state.report);
    return;
  }

  state.currentIndex = questions.findIndex((question) => !isAnswerFilled(state.answers[question.id]));
  if (state.currentIndex === -1) state.currentIndex = questions.length - 1;
  renderQuestion();
}

function sectionTitle(section) {
  if (section === 1) return "Let's Discover Your Hidden Talents";
  if (section === 2) return "How Strong Are Your Skills?";
  return "What Does Your Future Look Like?";
}

function renderQuestion() {
  quizShell.classList.remove("hidden");
  reportShell.classList.add("hidden");

  const question = questions[state.currentIndex];
  const localNumber = ((question.id - 1) % 10) + 1;
  document.querySelector("#sectionMeta").textContent = `Section ${question.section} of 3 - Question ${localNumber} of 10`;
  document.querySelector("#sectionTitle").textContent = sectionTitle(question.section);
  document.querySelector("#quizProgress").style.width = `${((state.currentIndex + 1) / questions.length) * 100}%`;
  document.querySelectorAll(".flow-stepper span").forEach((step) => step.classList.toggle("active", step.dataset.flow === String(question.section)));
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
    return `<div class="option-grid">${question.options.map((option) => `<label class="option-card"><input type="radio" name="answer" value="${escapeHtml(option)}" ${value === option ? "checked" : ""} /><span>${option}</span></label>`).join("")}</div>`;
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
  await request("/api/talent/answer", {
    method: "POST",
    body: JSON.stringify({ section: question.section, question_number: question.id, answer }),
  });
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

function showGenerationOverlay(show) {
  const overlay = document.querySelector("#loadingOverlay");
  overlay.classList.toggle("hidden", !show);
  window.clearInterval(state.loadingTimer);
  if (!show) return;
  let index = 0;
  document.querySelector("#loadingMessage").textContent = loadingMessages[index];
  state.loadingTimer = window.setInterval(() => {
    index = (index + 1) % loadingMessages.length;
    document.querySelector("#loadingMessage").textContent = loadingMessages[index];
  }, 1400);
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

function renderReport(report) {
  quizShell.classList.add("hidden");
  reportShell.classList.remove("hidden");
  document.querySelectorAll(".flow-stepper span").forEach((step) => step.classList.toggle("active", step.dataset.flow === "report"));
  const skills = Object.entries(report.skill_strength_scores || {}).slice(0, 5);
  const roadmap = String(report.career_roadmap || "").split("|").map((item) => item.trim()).filter(Boolean);

  document.querySelector("#reportMount").innerHTML = `
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
