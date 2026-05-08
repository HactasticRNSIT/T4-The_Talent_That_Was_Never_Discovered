const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-hiddenspark-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const OTP_TTL_MS = 5 * 60 * 1000;

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.static(path.join(__dirname, "..", "frontend")));

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]\n", "utf8");
  }
}

async function readUsers() {
  await ensureStore();
  const raw = await fs.readFile(USERS_FILE, "utf8");
  return JSON.parse(raw || "[]");
}

async function writeUsers(users) {
  await ensureStore();
  await fs.writeFile(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

function validateSignup(body) {
  const errors = {};
  const name = String(body.name || "").trim();
  const age = Number(body.age);
  const phone = normalizePhone(body.phone);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (name.length < 2) errors.name = "Full name must be at least 2 characters.";
  if (!Number.isInteger(age) || age < 1 || age > 120) errors.age = "Age must be a valid number.";
  if (!/^\d{10}$/.test(phone)) errors.phone = "Phone number must be 10 digits.";
  if (!validateEmail(email)) errors.email = "Enter a valid email address.";
  if (!validatePassword(password)) {
    errors.password = "Password needs 8+ chars, uppercase, lowercase, number, and symbol.";
  }
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

  return { errors, values: { name, age, phone, email, password } };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    phone: user.phone,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function signAuthToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signResetToken(user) {
  return jwt.sign({ sub: user.id, purpose: "password-reset" }, JWT_SECRET, { expiresIn: "10m" });
}

app.post("/api/auth/signup", async (req, res) => {
  const { errors, values } = validateSignup(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please fix the highlighted fields.", errors });

  const users = await readUsers();
  if (users.some((user) => user.email === values.email)) {
    return res.status(409).json({ message: "An account with this email already exists.", errors: { email: "Email is already registered." } });
  }
  if (users.some((user) => user.phone === values.phone)) {
    return res.status(409).json({ message: "An account with this phone number already exists.", errors: { phone: "Phone number is already registered." } });
  }

  const passwordHash = await bcrypt.hash(values.password, 12);
  const user = {
    id: crypto.randomUUID(),
    name: values.name,
    age: values.age,
    phone: values.phone,
    email: values.email,
    passwordHash,
    createdAt: new Date().toISOString(),
    otp: null,
  };

  users.push(user);
  await writeUsers(users);
  return res.status(201).json({ message: "Account created successfully.", user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const users = await readUsers();
  const user = users.find((candidate) => candidate.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({ message: "Login successful.", token: signAuthToken(user), user: publicUser(user) });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "Enter the 10-digit phone number registered with your account." });
  }

  const users = await readUsers();
  const index = users.findIndex((user) => user.phone === phone);
  if (index === -1) return res.status(404).json({ message: "No account was found for that phone number." });

  const otp = String(crypto.randomInt(100000, 999999));
  users[index].otp = {
    codeHash: await bcrypt.hash(otp, 10),
    expiresAt: Date.now() + OTP_TTL_MS,
    verified: false,
  };
  await writeUsers(users);

  console.log(`Mock OTP for ${phone}: ${otp}`);
  return res.json({ message: "OTP sent to registered phone number.", devOtp: otp });
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const otp = String(req.body.otp || "").trim();
  const users = await readUsers();
  const index = users.findIndex((user) => user.phone === phone);
  const user = users[index];

  if (!user || !user.otp) return res.status(400).json({ message: "Start the forgot password flow first." });
  if (Date.now() > user.otp.expiresAt) return res.status(400).json({ message: "OTP has expired. Please request a new one." });
  if (!(await bcrypt.compare(otp, user.otp.codeHash))) return res.status(400).json({ message: "The OTP is incorrect." });

  users[index].otp.verified = true;
  await writeUsers(users);
  return res.json({ message: "OTP verified.", resetToken: signResetToken(user) });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const resetToken = String(req.body.resetToken || "");
  const password = String(req.body.password || "");
  const confirmPassword = String(req.body.confirmPassword || "");

  if (!validatePassword(password)) {
    return res.status(400).json({ message: "Password needs 8+ chars, uppercase, lowercase, number, and symbol." });
  }
  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });

  let payload;
  try {
    payload = jwt.verify(resetToken, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Reset session expired. Please verify the OTP again." });
  }
  if (payload.purpose !== "password-reset") return res.status(401).json({ message: "Invalid reset token." });

  const users = await readUsers();
  const index = users.findIndex((user) => user.id === payload.sub && user.phone === phone);
  if (index === -1 || !users[index].otp?.verified) {
    return res.status(400).json({ message: "OTP verification is required before resetting the password." });
  }

  users[index].passwordHash = await bcrypt.hash(password, 12);
  users[index].otp = null;
  await writeUsers(users);
  return res.json({ message: "Password reset successful. You can now log in." });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

app.listen(PORT, () => {
  console.log(`HiddenSpark auth server running at http://localhost:${PORT}`);
});
