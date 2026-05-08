# HiddenSpark Talent Intelligence

A complete student talent intelligence app with signup, login, profile collection, AI-style domain analysis, domain confirmation, and a curated quiz flow.

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- Storage: JSON file collections in `backend/data`
- Security: password hashing with `bcrypt`, JWT with `jsonwebtoken`
- AI: optional OpenAI API via `OPENAI_API_KEY`, with a local analysis fallback for development

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

- `GET /api/profile`
- `POST /api/profile/draft`
- `POST /api/profile/analyse`
- `POST /api/domain-selection`
- `GET /api/questions?domain=Web%20Development`
- `POST /api/quiz/submit`
- `POST /api/admin/questions`

For local testing, forgot password returns the mocked OTP in the API response and logs it in the terminal.
