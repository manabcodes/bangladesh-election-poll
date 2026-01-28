# Bangladesh Election Poll 2026

Polling website for Dhaka-8, Dhaka-9, and Dhaka-15 constituencies.

## Setup

```bash
npm create vite@latest bangladesh-poll -- --template react
cd bangladesh-poll
npm install
npm install lucide-react
```

Replace `src/App.jsx` with the polling code (our src/App.jsx).

## Run

```bash
npm run dev
```

Open http://localhost:5173

## Deploy

```bash
npm run build
```

Upload the `dist` folder to Netlify, Vercel, or any static host.

## Next

We add database, captcha, IP tracking, more questions to verify if human.
