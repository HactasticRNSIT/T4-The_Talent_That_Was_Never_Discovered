const API_BASE = window.location.protocol === "file:" ? "http://localhost:4000" : "";
const tokenKey = "hiddenSparkAuthToken";
const userKey = "hiddenSparkUser";

const state = {
  resetPhone: "",
  resetToken: "",
};

const views = {
  login: document.querySelector("#loginView"),
  signup: document.querySelector("#signupView"),
  forgot: document.querySelector("#forgotView"),
  dashboard: document.querySelector("#dashboardView"),
};

const tabs = document.querySelectorAll(".tab");
const viewButtons = document.querySelectorAll("[data-view]");
const passwordToggles = document.querySelectorAll("[data-toggle]");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const phoneForm = document.querySelector("#phoneForm");
const otpForm = document.querySelector("#otpForm");
const resetPasswordForm = document.querySelector("#resetPasswordForm");
const logoutButton = document.querySelector("#logoutButton");

function showView(name) {
  Object.entries(views).forEach(([viewName, element]) => {
    element.classList.toggle("active", viewName === name);
  });

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === name);
  });

  clearMessages();
}

function setLoading(form, loading) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  button.disabled = loading;
  button.dataset.originalText ||= button.textContent;
  button.textContent = loading ? "Please wait..." : button.dataset.originalText;
}

function setMessage(id, message, type = "neutral") {
  const element = document.querySelector(`#${id}`);
  element.textContent = message || "";
  element.className = `form-message ${type}`;
}

function clearMessages() {
  document.querySelectorAll(".form-message").forEach((message) => {
    message.textContent = "";
    message.className = "form-message";
  });
  document.querySelectorAll(".error").forEach((error) => {
    error.textContent = "";
  });
}

function setFieldError(inputId, message) {
  const error = document.querySelector(`[data-error-for="${inputId}"]`);
  if (error) error.textContent = message || "";
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

function validateSignup(values) {
  const errors = {};
  if (!values.name?.trim() || values.name.trim().length < 2) errors.signupName = "Enter your full name.";
  if (!Number.isInteger(Number(values.age)) || Number(values.age) < 1 || Number(values.age) > 120) {
    errors.signupAge = "Age must be a valid number.";
  }
  if (!/^\d{10}$/.test(normalizePhone(values.phone))) errors.signupPhone = "Phone number must be 10 digits.";
  if (!isEmail(values.email)) errors.signupEmail = "Enter a valid email address.";
  if (!isStrongPassword(values.password)) {
    errors.signupPassword = "Use 8+ chars with uppercase, lowercase, number, and symbol.";
  }
  if (values.password !== values.confirmPassword) errors.signupConfirmPassword = "Passwords do not match.";
  return errors;
}

function validateLogin(values) {
  const errors = {};
  if (!isEmail(values.email)) errors.loginEmail = "Enter a valid email address.";
  if (!values.password) errors.loginPassword = "Enter your password.";
  return errors;
}

function validatePasswordReset(values) {
  const errors = {};
  if (!isStrongPassword(values.password)) {
    errors.newPassword = "Use 8+ chars with uppercase, lowercase, number, and symbol.";
  }
  if (values.password !== values.confirmPassword) errors.confirmNewPassword = "Passwords do not match.";
  return errors;
}

function showFieldErrors(errors) {
  Object.entries(errors).forEach(([id, message]) => setFieldError(id, message));
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.data = data;
    throw error;
  }
  return data;
}

function mapServerErrors(errors, prefix) {
  const fieldMap = {
    name: `${prefix}Name`,
    age: `${prefix}Age`,
    phone: `${prefix}Phone`,
    email: `${prefix}Email`,
    password: `${prefix}Password`,
    confirmPassword: prefix === "signup" ? "signupConfirmPassword" : "confirmNewPassword",
  };

  Object.entries(errors || {}).forEach(([field, message]) => {
    if (fieldMap[field]) setFieldError(fieldMap[field], message);
  });
}

function storeSession(data) {
  localStorage.setItem(tokenKey, data.token);
  localStorage.setItem(userKey, JSON.stringify(data.user));
  renderDashboard(data.user);
  showView("dashboard");
}

function renderDashboard(user) {
  document.querySelector("#dashboardName").textContent = `Welcome, ${user.name}`;
}

function updateResetStep(step) {
  const order = ["phone", "otp", "password"];
  document.querySelectorAll(".reset-form").forEach((form) => form.classList.remove("active"));
  document.querySelectorAll(".reset-step").forEach((item) => {
    item.classList.toggle("active", order.indexOf(item.dataset.resetStep) <= order.indexOf(step));
  });

  const titles = {
    phone: "Verify your phone",
    otp: "Enter the OTP",
    password: "Set a new password",
  };

  document.querySelector("#forgotTitle").textContent = titles[step];
  if (step === "phone") phoneForm.classList.add("active");
  if (step === "otp") otpForm.classList.add("active");
  if (step === "password") resetPasswordForm.classList.add("active");
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "forgot") updateResetStep("phone");
    showView(button.dataset.view);
  });
});

passwordToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.querySelector(`#${button.dataset.toggle}`);
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    button.textContent = visible ? "Show" : "Hide";
  });
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  const values = getFormData(signupForm);
  const errors = validateSignup(values);
  if (Object.keys(errors).length) return showFieldErrors(errors);

  setLoading(signupForm, true);
  try {
    await request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ ...values, phone: normalizePhone(values.phone) }),
    });
    signupForm.reset();
    showView("login");
    setMessage("loginMessage", "Account created successfully. You can log in now.", "success");
  } catch (error) {
    mapServerErrors(error.data?.errors, "signup");
    setMessage("signupMessage", error.message, "error");
  } finally {
    setLoading(signupForm, false);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  const values = getFormData(loginForm);
  const errors = validateLogin(values);
  if (Object.keys(errors).length) return showFieldErrors(errors);

  setLoading(loginForm, true);
  try {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
    });
    loginForm.reset();
    storeSession(data);
  } catch (error) {
    setMessage("loginMessage", error.message, "error");
  } finally {
    setLoading(loginForm, false);
  }
});

phoneForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  const phone = normalizePhone(document.querySelector("#resetPhone").value);
  if (!/^\d{10}$/.test(phone)) return setFieldError("resetPhone", "Phone number must be 10 digits.");

  setLoading(phoneForm, true);
  try {
    const data = await request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
    state.resetPhone = phone;
    updateResetStep("otp");
    setMessage("forgotMessage", `OTP sent. Mock OTP for local testing: ${data.devOtp}`, "success");
  } catch (error) {
    setMessage("forgotMessage", error.message, "error");
  } finally {
    setLoading(phoneForm, false);
  }
});

otpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  const otp = document.querySelector("#otpCode").value.trim();
  if (!/^\d{6}$/.test(otp)) return setFieldError("otpCode", "Enter the 6-digit OTP.");

  setLoading(otpForm, true);
  try {
    const data = await request("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone: state.resetPhone, otp }),
    });
    state.resetToken = data.resetToken;
    updateResetStep("password");
    setMessage("forgotMessage", data.message, "success");
  } catch (error) {
    setMessage("forgotMessage", error.message, "error");
  } finally {
    setLoading(otpForm, false);
  }
});

resetPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  const values = getFormData(resetPasswordForm);
  const errors = validatePasswordReset(values);
  if (Object.keys(errors).length) return showFieldErrors(errors);

  setLoading(resetPasswordForm, true);
  try {
    await request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ ...values, phone: state.resetPhone, resetToken: state.resetToken }),
    });
    phoneForm.reset();
    otpForm.reset();
    resetPasswordForm.reset();
    showView("login");
    setMessage("loginMessage", "Password reset successful. You can log in now.", "success");
  } catch (error) {
    setMessage("forgotMessage", error.message, "error");
  } finally {
    setLoading(resetPasswordForm, false);
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  showView("login");
});

const savedToken = localStorage.getItem(tokenKey);
const savedUser = JSON.parse(localStorage.getItem(userKey) || "null");
if (savedToken && savedUser) {
  renderDashboard(savedUser);
  showView("dashboard");
}
