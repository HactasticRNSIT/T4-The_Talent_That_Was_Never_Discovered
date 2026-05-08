const API_BASE = window.location.protocol === "file:" ? "http://localhost:4000" : "";
const tokenKey = "hiddenSparkAuthToken";
const userKey = "hiddenSparkUser";

const state = {
  user: JSON.parse(localStorage.getItem(userKey) || "null"),
  resetPhone: "",
  resetToken: "",
  profileStep: 0,
  profile: {
    name: "",
    age: "",
    cgpa: "",
    achievements: [{ title: "", description: "", year: "" }],
    events: [{ name: "", role: "Participant", location: "", date: "" }],
    roleModels: [{ name: "", why: "", domain: "" }],
    clubs: [{ name: "", institution: "", status: "Registered Member", domain: "Technology" }],
  },
  analysis: null,
  selectedDomain: "",
  questions: [],
  quizIndex: 0,
  quizAnswers: [],
  domains: [],
};

const authShell = document.querySelector("#authShell");
const appShell = document.querySelector("#appShell");
const profileSteps = [
  { title: "Personal Info", key: "personal" },
  { title: "Achievements", key: "achievements" },
  { title: "Events Participated", key: "events" },
  { title: "Inspirations & Role Models", key: "roleModels" },
  { title: "Clubs & Organizations", key: "clubs" },
];

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

function showAppView(name) {
  document.querySelectorAll(".app-view").forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
  document.querySelectorAll(".flow-stepper span").forEach((step) => step.classList.toggle("active", step.dataset.flow === name));
}

function clearMessages() {
  document.querySelectorAll(".form-message, .error").forEach((item) => (item.textContent = ""));
}

function setMessage(id, message, type = "neutral") {
  const item = document.querySelector(`#${id}`);
  item.textContent = message;
  item.className = `form-message ${type}`;
}

function setLoading(form, loading) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  button.dataset.originalText ||= button.textContent;
  button.textContent = loading ? "Please wait..." : button.dataset.originalText;
  button.disabled = loading;
}

function setFieldError(id, message) {
  const error = document.querySelector(`[data-error-for="${id}"]`);
  if (error) error.textContent = message;
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
  state.profile.name ||= state.user?.name || "";
  state.profile.age ||= state.user?.age || "";
  showAppView("profile");
  renderProfileStep();

  try {
    const data = await request("/api/profile");
    state.user = data.user;
    state.profile = data.profile || { ...state.profile, name: data.user.name, age: data.user.age };
    state.analysis = data.analysis;
    state.selectedDomain = data.domainSelection?.selectedDomain || "";
    if (data.quizAttempt) renderSubmitted(data.quizAttempt);
    else if (data.domainSelection) await startQuiz(data.domainSelection.selectedDomain);
    else if (data.analysis) renderAnalysis(data.analysis);
    else renderProfileStep();
  } catch (error) {
    setMessage("profileMessage", error.message, "error");
  }
}

function profilePayloadFromDom() {
  const payload = structuredClone(state.profile);
  document.querySelectorAll("[data-profile-field]").forEach((input) => {
    const field = input.dataset.profileField;
    const collection = input.dataset.collection;
    const index = Number(input.dataset.index);
    if (collection) payload[collection][index][field] = input.value;
    else payload[field] = input.value;
  });
  state.profile = payload;
  return payload;
}

function renderProfileStep() {
  const step = profileSteps[state.profileStep];
  document.querySelector("#profileStepMeta").textContent = `Step ${state.profileStep + 1} of ${profileSteps.length}`;
  document.querySelector("#profileStepTitle").textContent = step.title;
  document.querySelector("#profileProgress").style.width = `${((state.profileStep + 1) / profileSteps.length) * 100}%`;
  document.querySelector("#profileBack").disabled = state.profileStep === 0;
  document.querySelector("#profileNext").textContent = state.profileStep === profileSteps.length - 1 ? "Submit for AI Analysis" : "Continue";
  document.querySelector("#profileStepContent").innerHTML = renderStepContent(step.key);
}

function field(label, html) {
  return `<div class="field"><label>${label}</label>${html}</div>`;
}

function renderStepContent(key) {
  const p = state.profile;
  if (key === "personal") {
    return `<div class="form-grid">
      ${field("Full Name", `<input data-profile-field="name" value="${escapeHtml(p.name)}" />`)}
      ${field("Age", `<input data-profile-field="age" type="number" value="${escapeHtml(p.age)}" />`)}
      ${field("CGPA / Percentage", `<input data-profile-field="cgpa" placeholder="8.6 CGPA or 86%" value="${escapeHtml(p.cgpa)}" />`)}
    </div>`;
  }
  if (key === "achievements") return dynamicRows("achievements", ["title", "description", "year"], ["Title", "Description", "Year"]);
  if (key === "events") return dynamicRows("events", ["name", "role", "location", "date"], ["Event Name", "Role", "Location", "Date"]);
  if (key === "roleModels") return dynamicRows("roleModels", ["name", "why", "domain"], ["Role Model Name", "Why they inspire you", "Domain/Field"]);
  return dynamicRows("clubs", ["name", "institution", "status", "domain"], ["Club/Society Name", "College or School", "Status", "Domain"]);
}

function dynamicRows(collection, keys, labels) {
  return `<div class="dynamic-list">${state.profile[collection].map((item, index) => `
    <article class="dynamic-row">
      <button class="icon-button remove-row" type="button" data-remove="${collection}" data-index="${index}" aria-label="Remove row">x</button>
      <div class="form-grid">${keys.map((key, i) => field(labels[i], control(collection, key, item[key], index))).join("")}</div>
    </article>`).join("")}</div>
    <button class="secondary-button add-row" type="button" data-add="${collection}">Add ${labels[0]}</button>`;
}

function control(collection, key, value, index) {
  const attr = `data-profile-field="${key}" data-collection="${collection}" data-index="${index}"`;
  if (key === "role") return `<select ${attr}>${["Participant", "Organizer", "Volunteer"].map((o) => `<option ${value === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  if (key === "status") return `<select ${attr}>${["Registered Member", "Shown Interest", "Applied"].map((o) => `<option ${value === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  if (key === "domain" && collection === "clubs") return `<select ${attr}>${["Technology", "Design", "Business", "Social Impact", "Sports", "Arts", "Science", "Other"].map((o) => `<option ${value === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  if (key === "description" || key === "why") return `<textarea ${attr} rows="3">${escapeHtml(value)}</textarea>`;
  return `<input ${attr} ${key === "date" ? 'type="date"' : ""} value="${escapeHtml(value)}" />`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

async function saveDraft() {
  const payload = profilePayloadFromDom();
  await request("/api/profile/draft", { method: "POST", body: JSON.stringify(payload) });
  setMessage("profileMessage", "Draft saved.", "success");
}

async function analyseProfile() {
  document.querySelector("#analysisLoading").classList.remove("hidden");
  showAppView("analysis");
  const data = await request("/api/profile/analyse", { method: "POST", body: JSON.stringify(profilePayloadFromDom()) });
  state.profile = data.profile;
  state.analysis = data.analysis;
  renderAnalysis(data.analysis);
}

function renderAnalysis(analysis) {
  showAppView("analysis");
  document.querySelector("#analysisLoading").classList.add("hidden");
  document.querySelector("#analysisSummary").textContent = analysis.summary;
  const scores = analysis.confidence_scores || {};
  document.querySelector("#domainChart").innerHTML = Object.entries(scores).slice(0, 7).map(([domain, score]) => `
    <div class="bar-row"><span>${domain}</span><div><i style="width:${score}%"></i></div><strong>${score}%</strong></div>`).join("");
  document.querySelector("#reasoningList").innerHTML = (analysis.domains || []).map(({ domain }) => `
    <article><h4>${domain}</h4><ul>${(analysis.reasoning?.[domain] || []).map((reason) => `<li>${reason}</li>`).join("")}</ul></article>`).join("");
  renderDomainOptions();
}

async function renderDomainOptions() {
  const data = await request("/api/domains");
  state.domains = data.domains;
  const suggested = state.analysis?.domains || [];
  document.querySelector("#domainSuggestions").innerHTML = suggested.map((item, index) => `
    <label class="suggestion-card"><input type="radio" name="suggestedDomain" value="${item.domain}" ${index === 0 ? "checked" : ""} /><strong>${item.domain}</strong><span>${item.confidence}% confidence</span></label>`).join("");
  document.querySelector("#manualDomain").innerHTML = `<option value="">Use AI suggestion</option>${data.domains.map((domain) => `<option>${domain}</option>`).join("")}`;
}

async function startQuiz(domain) {
  state.selectedDomain = domain;
  const data = await request(`/api/questions?domain=${encodeURIComponent(domain)}`);
  state.questions = data.questions;
  state.quizAnswers = [];
  state.quizIndex = 0;
  showAppView("quiz");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const question = state.questions[state.quizIndex];
  document.querySelector("#quizDomainTitle").textContent = `${state.selectedDomain} Quiz`;
  document.querySelector("#quizMeta").textContent = `Question ${state.quizIndex + 1} of ${state.questions.length}`;
  document.querySelector("#quizProgress").style.width = `${((state.quizIndex + 1) / state.questions.length) * 100}%`;
  document.querySelector("#quizNext").textContent = state.quizIndex === state.questions.length - 1 ? "Submit Responses" : "Next";
  document.querySelector("#quizBack").disabled = state.quizIndex === 0;
  const saved = state.quizAnswers[state.quizIndex]?.answer || "";
  const answerControl = question.type === "MCQ"
    ? question.options.map((option) => `<label class="choice"><input type="radio" name="answer" value="${escapeHtml(option)}" ${saved === option ? "checked" : ""} />${option}</label>`).join("")
    : question.type === "Rating Scale"
      ? `<div class="rating">${[1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="answer" value="${n}" ${String(saved) === String(n) ? "checked" : ""} />${n}</label>`).join("")}</div>`
      : `<textarea name="answer" rows="5">${escapeHtml(saved)}</textarea>`;
  document.querySelector("#quizQuestion").innerHTML = `<article class="question-block"><span>${question.difficulty} / ${question.type}</span><h3>${question.question_text}</h3>${answerControl}</article>`;
}

async function submitQuiz() {
  const data = await request("/api/quiz/submit", {
    method: "POST",
    body: JSON.stringify({ domain: state.selectedDomain, answers: state.quizAnswers }),
  });
  renderSubmitted(data.attempt);
}

function renderSubmitted(attempt) {
  showAppView("submitted");
  document.querySelector("#quizFeedback").textContent = attempt.aiFeedback;
}

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

document.querySelector("#profileStepContent").addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  const remove = event.target.closest("[data-remove]");
  if (add) {
    profilePayloadFromDom();
    const empty = { achievements: { title: "", description: "", year: "" }, events: { name: "", role: "Participant", location: "", date: "" }, roleModels: { name: "", why: "", domain: "" }, clubs: { name: "", institution: "", status: "Registered Member", domain: "Technology" } };
    state.profile[add.dataset.add].push(empty[add.dataset.add]);
    renderProfileStep();
  }
  if (remove) {
    profilePayloadFromDom();
    const list = state.profile[remove.dataset.remove];
    if (list.length > 1) list.splice(Number(remove.dataset.index), 1);
    renderProfileStep();
  }
});

document.querySelector("#profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();
  if (state.profileStep < profileSteps.length - 1) {
    profilePayloadFromDom();
    state.profileStep += 1;
    renderProfileStep();
    return;
  }
  try {
    await analyseProfile();
  } catch (error) {
    showAppView("profile");
    setMessage("profileMessage", error.message, "error");
  }
});

document.querySelector("#profileBack").addEventListener("click", () => {
  profilePayloadFromDom();
  state.profileStep = Math.max(0, state.profileStep - 1);
  renderProfileStep();
});
document.querySelector("#saveDraft").addEventListener("click", () => saveDraft().catch((error) => setMessage("profileMessage", error.message, "error")));
document.querySelector("#toDomainButton").addEventListener("click", () => { renderDomainOptions(); showAppView("domain"); });
document.querySelector("#domainForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const suggested = document.querySelector('input[name="suggestedDomain"]:checked')?.value;
  const selectedDomain = document.querySelector("#manualDomain").value || suggested;
  try {
    await request("/api/domain-selection", { method: "POST", body: JSON.stringify({ selectedDomain, userNote: document.querySelector("#domainNote").value }) });
    await startQuiz(selectedDomain);
  } catch (error) {
    setMessage("domainMessage", error.message, "error");
  }
});

document.querySelector("#quizForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const answer = new FormData(event.currentTarget).get("answer") || "";
  state.quizAnswers[state.quizIndex] = { questionId: state.questions[state.quizIndex].id, answer };
  if (state.quizIndex < state.questions.length - 1) {
    state.quizIndex += 1;
    renderQuizQuestion();
    return;
  }
  await submitQuiz();
});
document.querySelector("#quizBack").addEventListener("click", () => {
  state.quizIndex = Math.max(0, state.quizIndex - 1);
  renderQuizQuestion();
});
document.querySelector("#restartProfile").addEventListener("click", () => { state.profileStep = 0; showAppView("profile"); renderProfileStep(); });
document.querySelector("#logoutButton").addEventListener("click", logout);

if (token() && state.user) bootApp();
