# HiddenSpark Auth

A complete authentication flow for HiddenSpark with signup, login, JWT sessions, and mocked phone OTP password recovery.

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- Storage: JSON file database at `backend/data/users.json`
- Security: password hashing with `bcrypt`, JWT with `jsonwebtoken`

## Run

```bash
cd backend
npm install
npm start
```

Open `http://localhost:4000`.

## API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`

For local testing, forgot password returns the mocked OTP in the API response and logs it in the terminal.
