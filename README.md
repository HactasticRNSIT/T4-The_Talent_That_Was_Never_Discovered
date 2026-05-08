# HiddenSpark Hidden Talent Identification

A complete AI-powered hidden talent assessment app with signup, login, optional social profile completion, a 30-question protected quiz, autosaved answers, and a structured AI-style career/talent report.

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- Storage: JSON file collections in `backend/data`
- Security: password hashing with `bcrypt`, JWT with `jsonwebtoken`
- AI: optional OpenAI API via `OPENAI_API_KEY`, with a local talent analysis fallback for development

## Run

```bash
cd backend
npm install
npm start
```

Open `http://localhost:4000`.

## API Routes

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`

Protected app:

- `GET /api/socials`
- `POST /api/socials`
- `GET /api/talent/state`
- `POST /api/talent/answer`
- `POST /api/talent/analyse`
- `POST /api/talent/retake`

## Assessment Flow

```text
Login -> Complete Profile -> Section 1 (Q1-Q10) -> Section 2 (Q11-Q20) -> Section 3 (Q21-Q30) -> AI Report
```

The social profile step stores optional LinkedIn, GitHub, Snapchat, Instagram, Facebook, Twitter/X, Reddit, Quora, YouTube, ChatGPT, Claude, and Gemini values in `backend/data/user-socials.json`.

The final report includes personality traits, learning style, skill strength bars, hidden talents, leadership and entrepreneurial scores, career paths, roadmap, improvement suggestions, PDF print/download, and retake support.

For local testing, forgot password returns the mocked OTP in the API response and logs it in the terminal.
