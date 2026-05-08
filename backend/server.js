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
  userSocials: path.join(DATA_DIR, "user-socials.json"),
  talentAnswers: path.join(DATA_DIR, "talent-answers.json"),
  talentReports: path.join(DATA_DIR, "talent-reports.json"),
};

const socialFields = ["linkedin", "github", "snapchat", "instagram", "facebook", "twitter", "reddit", "quora", "youtube"];

app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.static(path.join(__dirname, "..", "frontend")));

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await Promise.all(
    Object.values(files).map(async (file) => {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, "[]\n", "utf8");
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

function cleanText(value) {
  return String(value || "").trim();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

function isValidSocialValue(value) {
  const text = cleanText(value);
  if (!text) return true;
  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname.includes("."));
    } catch {
      return false;
    }
  }
  return !/\s/.test(text) && text.length <= 120;
}

function normalizeSocials(body) {
  return Object.fromEntries(socialFields.map((field) => [field, cleanText(body[field])]));
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
  const name = cleanText(body.name);
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

function answerToText(answer) {
  if (Array.isArray(answer)) return answer.join(", ");
  if (answer && typeof answer === "object") return JSON.stringify(answer);
  return cleanText(answer);
}

function scoreFromWords(text, words) {
  const haystack = text.toLowerCase();
  return words.reduce((score, word) => score + (haystack.includes(word) ? 1.15 : 0), 0);
}

function clampScore(value) {
  return Math.max(4.8, Math.min(9.8, Number(value.toFixed(1))));
}

function getAnswerMap(answers) {
  return Object.fromEntries(answers.map((item) => [Number(item.question_number), item.answer]));
}

function localTalentReport(answers) {
  const byQuestion = getAnswerMap(answers);
  const allText = answers.map((item) => answerToText(item.answer)).join(" ").toLowerCase();
  const selected = (number) => answerToText(byQuestion[number] || "").toLowerCase();

  const rawSkillScores = {
    "Creative Ideation": 5.8 + scoreFromWords(allText, ["creative", "create", "design", "drawing", "story", "idea", "art", "imagine", "new"]),
    "Technical Building": 5.5 + scoreFromWords(allText, ["coding", "tech", "technology", "app", "build", "machine", "data", "ai", "computer"]),
    "Problem Solving": 5.7 + scoreFromWords(allText, ["solve", "problem", "logic", "puzzle", "different", "challenge", "system"]),
    Leadership: 5.2 + scoreFromWords(`${selected(2)} ${selected(8)} ${selected(25)} ${selected(26)}`, ["leader", "leading", "teams", "organizer", "manage"]),
    Communication: 5.2 + scoreFromWords(allText, ["presenter", "communicator", "speaking", "explaining", "teaching", "writing", "performing"]),
    Research: 5.1 + scoreFromWords(allText, ["research", "discover", "deeply", "science", "information", "unknown", "experiment"]),
    Empathy: 5.1 + scoreFromWords(allText, ["helping", "people", "emotionally", "mediator", "mental", "health", "social"]),
    Organization: 5 + scoreFromWords(allText, ["planner", "organizer", "organizing", "structured", "process", "systems"]),
    Entrepreneurship: 4.9 + scoreFromWords(allText, ["business", "company", "startup", "money", "market", "leadership", "impact"]),
    "Physical Drive": 4.8 + scoreFromWords(allText, ["sports", "physical", "outdoors", "fitness", "competing"]),
  };

  const skill_strength_scores = Object.fromEntries(
    Object.entries(rawSkillScores)
      .map(([skill, score]) => [skill, clampScore(score)])
      .sort((a, b) => b[1] - a[1]),
  );
  const top_5_skills = Object.keys(skill_strength_scores).slice(0, 5);
  const hidden_talents = top_5_skills.slice(0, 4).map((skill) => `${skill} potential`);
  const leadershipScore = clampScore(rawSkillScores.Leadership + (selected(2).includes("leader") ? 0.8 : 0));
  const entrepreneurialScore = clampScore(rawSkillScores.Entrepreneurship + (allText.includes("build") ? 0.4 : 0));
  const personality_traits = [
    rawSkillScores["Creative Ideation"] > 7 ? "Imaginative" : "Reflective",
    rawSkillScores["Problem Solving"] > 7 ? "Analytical" : "Curious",
    leadershipScore > 7 ? "Initiative-driven" : "Self-aware",
    selected(9).length > 30 ? "Resilient" : "Growth-minded",
    rawSkillScores.Empathy > 7 ? "Empathetic" : "Independent",
  ];

  const careerMap = {
    "Creative Ideation": "UX Designer or Creative Technologist",
    "Technical Building": "Software Developer or AI Product Builder",
    "Problem Solving": "Data Analyst or Systems Engineer",
    Leadership: "Product Manager or Program Lead",
    Communication: "Educator, Presenter, or Content Strategist",
    Research: "Research Scientist or Policy Analyst",
    Empathy: "Counsellor, Social Innovator, or Community Lead",
    Organization: "Operations Manager or Event Strategist",
    Entrepreneurship: "Founder or Business Strategist",
    "Physical Drive": "Sports Scientist or Performance Coach",
  };
  const best_career_paths = top_5_skills.slice(0, 3).map((skill) => careerMap[skill]);

  return {
    hidden_talents,
    top_5_skills,
    skill_strength_scores,
    personality_traits: [...new Set(personality_traits)],
    leadership_potential: {
      score: Math.round(leadershipScore),
      analysis:
        leadershipScore >= 7
          ? "Your answers show willingness to coordinate people, take ownership, and influence outcomes."
          : "Your leadership may be quieter right now, showing up through reliability, reflection, and support roles.",
    },
    creativity_analysis:
      rawSkillScores["Creative Ideation"] >= 7
        ? "You show strong creative energy through idea generation, building, imagining, or creating original responses."
        : "Your creativity appears emerging and may grow fastest through open-ended projects and low-pressure experimentation.",
    communication_eq_analysis:
      rawSkillScores.Communication + rawSkillScores.Empathy >= 13
        ? "Your responses suggest you can understand people, explain ideas, and read emotional context thoughtfully."
        : "Communication and emotional intelligence can be strengthened through presenting, mentoring, and feedback conversations.",
    learning_style:
      selected(7).length > 45 || allText.includes("taught myself")
        ? "Self-directed, project-based learning with experimentation and reflection."
        : "Guided practice with examples first, followed by small independent challenges.",
    best_career_paths,
    emerging_careers: [
      "AI Product Builder",
      "Human-Centered Data Analyst",
      "Creative Technology Specialist",
      "Social Innovation Designer",
    ].slice(0, 3),
    entrepreneurial_potential_score: Math.round(entrepreneurialScore),
    most_underrated_talent: top_5_skills[3] || "Curiosity",
    unrealized_potential: [
      "Turning interests into measurable projects or portfolios.",
      "Practicing under real deadlines or public feedback.",
      "Combining your strongest skill with communication and leadership.",
    ],
    skill_improvements: [
      `Build one small ${best_career_paths[0]?.split(" or ")[0] || "career"} project in the next 30 days.`,
      "Keep a weekly learning journal with wins, mistakes, and questions.",
      "Ask a mentor or peer to review your work twice per month.",
      "Join one event, club, competition, or public challenge related to your strongest skill.",
    ],
    career_roadmap:
      "0-3 months: choose one focus skill and build two small projects. | 3-6 months: publish your work, gather feedback, and enter one challenge. | 6-12 months: deepen the skill with mentors, internships, or advanced coursework. | 1-2 years: build a portfolio around a real-world problem and test career paths through projects.",
    final_summary:
      "Your profile suggests a student with meaningful hidden potential that can become clearer through consistent practice, real projects, and feedback. The strongest signals come from your interests, how you describe challenges, and the roles you naturally gravitate toward. With focused exploration, you can convert curiosity into visible skill and career direction.",
    source: "local-analysis",
  };
}

async function generateTalentReport(answers) {
  if (!process.env.OPENAI_API_KEY) return localTalentReport(answers);

  const prompt = `You are an AI-based Student Talent & Career Intelligence System.
Analyze the following 30 answers from a student.
Analyze not just the selected options but also:
- Writing style, confidence, emotional tone
- Creativity, curiosity, leadership indicators
- Problem-solving patterns, motivation signals

Return ONLY a JSON object with these fields:
{
  "hidden_talents": [],
  "top_5_skills": [],
  "skill_strength_scores": { "skill": "score_out_of_10" },
  "personality_traits": [],
  "leadership_potential": { "score": 0, "analysis": "" },
  "creativity_analysis": "",
  "communication_eq_analysis": "",
  "learning_style": "",
  "best_career_paths": [],
  "emerging_careers": [],
  "entrepreneurial_potential_score": 0,
  "most_underrated_talent": "",
  "unrealized_potential": [],
  "skill_improvements": [],
  "career_roadmap": "",
  "final_summary": ""
}

Answers:
${JSON.stringify(answers, null, 2)}`;

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
    console.error("Talent AI fallback:", error.message);
    return localTalentReport(answers);
  }
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

app.get("/api/talent/state", requireAuth, async (req, res) => {
  const [users, socials, answers, reports] = await Promise.all([
    readCollection("users"),
    readCollection("userSocials"),
    readCollection("talentAnswers"),
    readCollection("talentReports"),
  ]);
  const user = users.find((item) => item.id === req.auth.sub);
  if (!user) return res.status(404).json({ message: "User not found." });

  return res.json({
    user: publicUser(user),
    socials: socials.find((item) => item.userId === req.auth.sub) || null,
    answers: answers.filter((item) => item.userId === req.auth.sub).sort((a, b) => a.question_number - b.question_number),
    report: reports.filter((item) => item.userId === req.auth.sub).at(-1) || null,
  });
});

app.get("/api/socials", requireAuth, async (req, res) => {
  const socials = await readCollection("userSocials");
  return res.json({ socials: socials.find((item) => item.userId === req.auth.sub) || null });
});

app.post("/api/socials", requireAuth, async (req, res) => {
  const values = normalizeSocials(req.body);
  const invalid = socialFields.filter((field) => !isValidSocialValue(values[field]));
  if (invalid.length) {
    return res.status(400).json({
      message: "Please enter valid URLs or usernames for the highlighted social accounts.",
      errors: Object.fromEntries(invalid.map((field) => [field, "Enter a valid URL or username."])),
    });
  }

  const socials = await readCollection("userSocials");
  const entry = {
    id: crypto.randomUUID(),
    userId: req.auth.sub,
    ...values,
    updatedAt: new Date().toISOString(),
  };
  const index = socials.findIndex((item) => item.userId === req.auth.sub);
  if (index >= 0) socials[index] = { ...socials[index], ...entry, id: socials[index].id };
  else socials.push(entry);

  await writeCollection("userSocials", socials);
  return res.json({ message: "Social profile saved.", socials: index >= 0 ? socials[index] : entry });
});

app.post("/api/talent/answer", requireAuth, async (req, res) => {
  const section = Number(req.body.section);
  const questionNumber = Number(req.body.question_number);
  if (![1, 2, 3].includes(section) || questionNumber < 1 || questionNumber > 30) {
    return res.status(400).json({ message: "Invalid section or question number." });
  }

  const answer = Array.isArray(req.body.answer) ? req.body.answer.map(cleanText).filter(Boolean) : req.body.answer;
  const answers = await readCollection("talentAnswers");
  const entry = {
    id: crypto.randomUUID(),
    userId: req.auth.sub,
    section,
    question_number: questionNumber,
    answer,
    savedAt: new Date().toISOString(),
  };
  const index = answers.findIndex((item) => item.userId === req.auth.sub && item.question_number === questionNumber);
  if (index >= 0) answers[index] = { ...answers[index], ...entry, id: answers[index].id };
  else answers.push(entry);

  await writeCollection("talentAnswers", answers);
  return res.json({ message: "Answer saved.", answer: index >= 0 ? answers[index] : entry });
});

app.post("/api/talent/analyse", requireAuth, async (req, res) => {
  const answers = (await readCollection("talentAnswers"))
    .filter((item) => item.userId === req.auth.sub)
    .sort((a, b) => a.question_number - b.question_number);
  const answeredCount = new Set(answers.map((item) => item.question_number)).size;
  if (answeredCount < 30) return res.status(400).json({ message: `Please answer all 30 questions first. You have answered ${answeredCount}.` });

  const generated = await generateTalentReport(answers);
  const report = {
    id: crypto.randomUUID(),
    userId: req.auth.sub,
    ...generated,
    generatedAt: new Date().toISOString(),
  };
  const reports = await readCollection("talentReports");
  reports.push(report);
  await writeCollection("talentReports", reports);
  return res.json({ report });
});

app.post("/api/talent/retake", requireAuth, async (req, res) => {
  const [answers, reports] = await Promise.all([readCollection("talentAnswers"), readCollection("talentReports")]);
  await writeCollection("talentAnswers", answers.filter((item) => item.userId !== req.auth.sub));
  await writeCollection("talentReports", reports.filter((item) => item.userId !== req.auth.sub));
  return res.json({ message: "Assessment cleared." });
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
