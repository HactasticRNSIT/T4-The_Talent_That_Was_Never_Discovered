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
const OTP_TTL_MS = 5 * 60 * 1000;

const files = {
  users: path.join(DATA_DIR, "users.json"),
  profiles: path.join(DATA_DIR, "profiles.json"),
  analyses: path.join(DATA_DIR, "analyses.json"),
  domainSelections: path.join(DATA_DIR, "domain-selections.json"),
  questions: path.join(DATA_DIR, "questions.json"),
  quizAttempts: path.join(DATA_DIR, "quiz-attempts.json"),
};

const domainOptions = [
  "Web Development",
  "Machine Learning",
  "Entrepreneurship",
  "Design",
  "Research",
  "Social Leadership",
  "Product Management",
  "Data Science",
  "Cybersecurity",
  "Arts",
  "Sports",
  "Science",
];

const seedQuestions = domainOptions.flatMap((domain) =>
  Array.from({ length: 10 }, (_, index) => {
    const types = ["MCQ", "Short Answer", "Rating Scale"];
    const difficulties = ["Easy", "Medium", "Hard"];
    const type = types[index % types.length];
    return {
      id: crypto.randomUUID(),
      domain,
      question_text:
        type === "MCQ"
          ? `Which approach best matches your instinct when working in ${domain}?`
          : type === "Short Answer"
            ? `Describe one ${domain} idea or project you would like to build and why.`
            : `Rate your current confidence in learning ${domain}.`,
      type,
      options:
        type === "MCQ"
          ? ["Explore examples first", "Plan the full system", "Build a prototype", "Ask users for feedback"]
          : type === "Rating Scale"
            ? ["1", "2", "3", "4", "5"]
            : [],
      difficulty: difficulties[index % difficulties.length],
    };
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.static(path.join(__dirname, "..", "frontend")));

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await Promise.all(
    Object.entries(files).map(async ([key, file]) => {
      try {
        await fs.access(file);
      } catch {
        const initial = key === "questions" ? seedQuestions : [];
        await fs.writeFile(file, `${JSON.stringify(initial, null, 2)}\n`, "utf8");
      }
    }),
  );
}

async function readCollection(key) {
  await ensureStore();
  const raw = await fs.readFile(files[key], "utf8");
  return JSON.parse(raw || "[]");
}

async function writeCollection(key, value) {
  await ensureStore();
  await fs.writeFile(files[key], `${JSON.stringify(value, null, 2)}\n`, "utf8");
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

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Login required." });

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
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
  if (!validatePassword(password)) errors.password = "Password needs 8+ chars, uppercase, lowercase, number, and symbol.";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

  return { errors, values: { name, age, phone, email, password } };
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeProfile(body, user) {
  return {
    userId: user.id,
    name: cleanText(body.name) || user.name,
    age: Number(body.age || user.age || 0),
    cgpa: cleanText(body.cgpa),
    achievements: Array.isArray(body.achievements) ? body.achievements.map((item) => ({
      title: cleanText(item.title),
      description: cleanText(item.description),
      year: cleanText(item.year),
    })).filter((item) => item.title || item.description || item.year) : [],
    events: Array.isArray(body.events) ? body.events.map((item) => ({
      name: cleanText(item.name),
      role: cleanText(item.role),
      location: cleanText(item.location),
      date: cleanText(item.date),
    })).filter((item) => item.name || item.role || item.location || item.date) : [],
    roleModels: Array.isArray(body.roleModels) ? body.roleModels.map((item) => ({
      name: cleanText(item.name),
      why: cleanText(item.why),
      domain: cleanText(item.domain),
    })).filter((item) => item.name || item.why || item.domain) : [],
    clubs: Array.isArray(body.clubs) ? body.clubs.map((item) => ({
      name: cleanText(item.name),
      institution: cleanText(item.institution),
      status: cleanText(item.status),
      domain: cleanText(item.domain),
    })).filter((item) => item.name || item.institution || item.status || item.domain) : [],
    updatedAt: new Date().toISOString(),
  };
}

function keywordScore(text, words) {
  const haystack = text.toLowerCase();
  return words.reduce((score, word) => score + (haystack.includes(word) ? 14 : 0), 0);
}

function localAnalysis(profile) {
  const blob = JSON.stringify(profile).toLowerCase();
  const base = {
    "Web Development": keywordScore(blob, ["web", "website", "app", "frontend", "backend", "javascript", "react", "coding"]),
    "Machine Learning": keywordScore(blob, ["ai", "ml", "machine", "model", "data", "prediction", "python"]),
    Entrepreneurship: keywordScore(blob, ["startup", "business", "company", "pitch", "market", "entrepreneur", "product"]),
    Design: keywordScore(blob, ["design", "drawing", "ui", "ux", "visual", "art", "creative"]),
    Research: keywordScore(blob, ["research", "paper", "science", "experiment", "discover", "study"]),
    "Social Leadership": keywordScore(blob, ["volunteer", "social", "lead", "community", "organizer", "help", "impact"]),
    Sports: keywordScore(blob, ["sport", "football", "cricket", "athlete", "fitness", "team"]),
  };

  profile.clubs.forEach((club) => {
    if (club.domain === "Technology") base["Web Development"] += 18;
    if (club.domain === "Business") base.Entrepreneurship += 18;
    if (club.domain === "Design") base.Design += 18;
    if (club.domain === "Social Impact") base["Social Leadership"] += 18;
    if (club.domain === "Science") base.Research += 18;
    if (club.domain === "Sports") base.Sports += 18;
    if (club.domain === "Arts") base.Arts = (base.Arts || 20) + 18;
  });

  profile.events.forEach((event) => {
    if (event.role === "Organizer") base["Social Leadership"] += 12;
    if (event.role === "Volunteer") base["Social Leadership"] += 9;
  });

  const confidence_scores = Object.fromEntries(
    Object.entries(base)
      .map(([domain, score]) => [domain, Math.max(35, Math.min(96, score + 35 + profile.achievements.length * 4))])
      .sort((a, b) => b[1] - a[1]),
  );
  const domains = Object.entries(confidence_scores).slice(0, 3).map(([domain, confidence]) => ({ domain, confidence }));
  const reasoning = {};
  domains.forEach(({ domain }) => {
    reasoning[domain] = [
      `${profile.achievements.length || "No"} achievement entries show evidence of initiative and follow-through.`,
      `${profile.events.length || "No"} event records and ${profile.clubs.length || "no"} club records shaped this suggestion.`,
      profile.roleModels.some((model) => model.domain && domain.toLowerCase().includes(model.domain.toLowerCase()))
        ? "A role model belongs to a closely related domain."
        : "The profile language and activity patterns align with this domain.",
    ];
  });

  return {
    domains,
    summary: `${profile.name} appears to be a student with growing direction, visible initiative, and interests that can be shaped into a clearer career path. Their achievements, event participation, role models, and club choices suggest a mix of motivation and exploratory potential. The strongest signals point toward ${domains.map((item) => item.domain).join(", ")}.`,
    reasoning,
    confidence_scores,
    source: "local-analysis",
  };
}

async function aiAnalysis(profile) {
  if (!process.env.OPENAI_API_KEY) return localAnalysis(profile);

  const prompt = `You are an AI-based Student Talent & Career Intelligence System. Analyse the student profile holistically and return only JSON with domains[], summary, reasoning{}, confidence_scores{}. Profile: ${JSON.stringify(profile)}`;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "Return strict JSON only. No markdown." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    const data = await response.json();
    return { ...JSON.parse(data.choices[0].message.content), source: "openai" };
  } catch (error) {
    console.error("AI analysis fallback:", error.message);
    return localAnalysis(profile);
  }
}

function quizFeedback(domain, answers) {
  const answered = answers.filter((answer) => cleanText(answer.answer)).length;
  const written = answers.filter((answer) => cleanText(answer.answer).length > 20).length;
  return `Based on your ${domain} quiz answers, you showed ${answered}/10 completed responses and ${written} reflective written answers. Your responses suggest an early but meaningful signal for ${domain}; keep building small projects, documenting decisions, and asking for feedback to convert interest into strength.`;
}

app.post("/api/auth/signup", async (req, res) => {
  const { errors, values } = validateSignup(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please fix the highlighted fields.", errors });

  const users = await readCollection("users");
  if (users.some((user) => user.email === values.email)) {
    return res.status(409).json({ message: "An account with this email already exists.", errors: { email: "Email is already registered." } });
  }
  if (users.some((user) => user.phone === values.phone)) {
    return res.status(409).json({ message: "An account with this phone number already exists.", errors: { phone: "Phone number is already registered." } });
  }

  const user = {
    id: crypto.randomUUID(),
    name: values.name,
    age: values.age,
    phone: values.phone,
    email: values.email,
    passwordHash: await bcrypt.hash(values.password, 12),
    createdAt: new Date().toISOString(),
    otp: null,
  };

  users.push(user);
  await writeCollection("users", users);
  return res.status(201).json({ message: "Account created successfully.", user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const users = await readCollection("users");
  const user = users.find((candidate) => candidate.email === email);
  if (!user || !(await bcrypt.compare(String(req.body.password || ""), user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  return res.json({ message: "Login successful.", token: signAuthToken(user), user: publicUser(user) });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: "Enter the 10-digit phone number registered with your account." });

  const users = await readCollection("users");
  const index = users.findIndex((user) => user.phone === phone);
  if (index === -1) return res.status(404).json({ message: "No account was found for that phone number." });

  const otp = String(crypto.randomInt(100000, 999999));
  users[index].otp = { codeHash: await bcrypt.hash(otp, 10), expiresAt: Date.now() + OTP_TTL_MS, verified: false };
  await writeCollection("users", users);
  console.log(`Mock OTP for ${phone}: ${otp}`);
  return res.json({ message: "OTP sent to registered phone number.", devOtp: otp });
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const users = await readCollection("users");
  const index = users.findIndex((user) => user.phone === phone);
  const user = users[index];
  if (!user || !user.otp) return res.status(400).json({ message: "Start the forgot password flow first." });
  if (Date.now() > user.otp.expiresAt) return res.status(400).json({ message: "OTP has expired. Please request a new one." });
  if (!(await bcrypt.compare(String(req.body.otp || "").trim(), user.otp.codeHash))) return res.status(400).json({ message: "The OTP is incorrect." });

  users[index].otp.verified = true;
  await writeCollection("users", users);
  return res.json({ message: "OTP verified.", resetToken: jwt.sign({ sub: user.id, purpose: "password-reset" }, JWT_SECRET, { expiresIn: "10m" }) });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");
  if (!validatePassword(password)) return res.status(400).json({ message: "Password needs 8+ chars, uppercase, lowercase, number, and symbol." });
  if (password !== String(req.body.confirmPassword || "")) return res.status(400).json({ message: "Passwords do not match." });

  let payload;
  try {
    payload = jwt.verify(String(req.body.resetToken || ""), JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Reset session expired. Please verify the OTP again." });
  }

  const users = await readCollection("users");
  const index = users.findIndex((user) => user.id === payload.sub && user.phone === phone);
  if (index === -1 || !users[index].otp?.verified) return res.status(400).json({ message: "OTP verification is required before resetting the password." });

  users[index].passwordHash = await bcrypt.hash(password, 12);
  users[index].otp = null;
  await writeCollection("users", users);
  return res.json({ message: "Password reset successful. You can now log in." });
});

app.get("/api/me", requireAuth, async (req, res) => {
  const users = await readCollection("users");
  const user = users.find((item) => item.id === req.auth.sub);
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ user: publicUser(user) });
});

app.get("/api/profile", requireAuth, async (req, res) => {
  const [users, profiles, analyses, selections, attempts] = await Promise.all([
    readCollection("users"),
    readCollection("profiles"),
    readCollection("analyses"),
    readCollection("domainSelections"),
    readCollection("quizAttempts"),
  ]);
  const user = users.find((item) => item.id === req.auth.sub);
  return res.json({
    user: publicUser(user),
    profile: profiles.find((item) => item.userId === req.auth.sub) || null,
    analysis: analyses.filter((item) => item.userId === req.auth.sub).at(-1) || null,
    domainSelection: selections.find((item) => item.userId === req.auth.sub) || null,
    quizAttempt: attempts.filter((item) => item.userId === req.auth.sub).at(-1) || null,
  });
});

app.post("/api/profile/draft", requireAuth, async (req, res) => {
  const users = await readCollection("users");
  const user = users.find((item) => item.id === req.auth.sub);
  const profile = { ...normalizeProfile(req.body, user), status: "draft" };
  const profiles = await readCollection("profiles");
  const index = profiles.findIndex((item) => item.userId === req.auth.sub);
  if (index >= 0) profiles[index] = { ...profiles[index], ...profile };
  else profiles.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...profile });
  await writeCollection("profiles", profiles);
  return res.json({ message: "Draft saved.", profile: profiles.find((item) => item.userId === req.auth.sub) });
});

app.post("/api/profile/analyse", requireAuth, async (req, res) => {
  const users = await readCollection("users");
  const user = users.find((item) => item.id === req.auth.sub);
  const profile = { ...normalizeProfile(req.body, user), status: "submitted", submittedAt: new Date().toISOString() };
  const profiles = await readCollection("profiles");
  const profileIndex = profiles.findIndex((item) => item.userId === req.auth.sub);
  const savedProfile = profileIndex >= 0 ? { ...profiles[profileIndex], ...profile } : { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...profile };
  if (profileIndex >= 0) profiles[profileIndex] = savedProfile;
  else profiles.push(savedProfile);
  await writeCollection("profiles", profiles);

  const analysis = {
    id: crypto.randomUUID(),
    userId: req.auth.sub,
    ...(await aiAnalysis(savedProfile)),
    createdAt: new Date().toISOString(),
  };
  const analyses = await readCollection("analyses");
  analyses.push(analysis);
  await writeCollection("analyses", analyses);
  return res.json({ profile: savedProfile, analysis });
});

app.post("/api/domain-selection", requireAuth, async (req, res) => {
  const selectedDomain = cleanText(req.body.selectedDomain);
  if (!selectedDomain) return res.status(400).json({ message: "Select a domain first." });

  const selections = await readCollection("domainSelections");
  const selection = {
    id: crypto.randomUUID(),
    userId: req.auth.sub,
    selectedDomain,
    userNote: cleanText(req.body.userNote),
    confirmedAt: new Date().toISOString(),
  };
  const index = selections.findIndex((item) => item.userId === req.auth.sub);
  if (index >= 0) selections[index] = selection;
  else selections.push(selection);
  await writeCollection("domainSelections", selections);
  return res.json({ selection });
});

app.get("/api/questions", requireAuth, async (req, res) => {
  const domain = cleanText(req.query.domain);
  const questions = await readCollection("questions");
  const matching = questions.filter((item) => item.domain === domain);
  return res.json({ questions: matching.slice(0, 10) });
});

app.post("/api/admin/questions", requireAuth, async (req, res) => {
  const question = {
    id: crypto.randomUUID(),
    domain: cleanText(req.body.domain),
    question_text: cleanText(req.body.question_text),
    type: cleanText(req.body.type),
    options: Array.isArray(req.body.options) ? req.body.options.map(cleanText).filter(Boolean) : [],
    difficulty: cleanText(req.body.difficulty),
  };
  if (!question.domain || !question.question_text || !question.type || !question.difficulty) {
    return res.status(400).json({ message: "Domain, question text, type, and difficulty are required." });
  }
  const questions = await readCollection("questions");
  questions.push(question);
  await writeCollection("questions", questions);
  return res.status(201).json({ question });
});

app.post("/api/quiz/submit", requireAuth, async (req, res) => {
  const domain = cleanText(req.body.domain);
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  if (!domain || answers.length === 0) return res.status(400).json({ message: "Quiz answers are required." });

  const attempt = {
    id: crypto.randomUUID(),
    userId: req.auth.sub,
    domain,
    answers,
    submittedAt: new Date().toISOString(),
    aiFeedback: quizFeedback(domain, answers),
  };
  const attempts = await readCollection("quizAttempts");
  attempts.push(attempt);
  await writeCollection("quizAttempts", attempts);
  return res.json({ attempt });
});

app.get("/api/domains", requireAuth, (_req, res) => {
  res.json({ domains: domainOptions });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

app.listen(PORT, () => {
  console.log(`HiddenSpark server running at http://localhost:${PORT}`);
});
