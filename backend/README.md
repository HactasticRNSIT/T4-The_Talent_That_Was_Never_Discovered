# HiddenSpark Auth Backend

Run from this folder:

```bash
npm install
npm start
```

The API serves the frontend from `../frontend` and stores JSON collections in `data/`.

Create a `.env` from `.env.example` before production use and replace `JWT_SECRET` with a long random value. Add `OPENAI_API_KEY` to use OpenAI for the hidden talent report; without it, the app uses a local deterministic analysis fallback.
