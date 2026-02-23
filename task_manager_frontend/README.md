This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Configuration

This frontend is compatible with **Next.js static export** (`output: "export"`) and uses **client-side auth** (token stored in `localStorage`).

Create an env file (or set env vars in your runtime):

- `NEXT_PUBLIC_API_BASE_URL` – Base URL of the FastAPI backend (example: `https://your-backend.example.com`)

See `.env.example`.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the result.

## Notes

- The app calls the backend directly from the browser using `fetch`.
- If your backend routes differ, adjust the fallback paths in `src/lib/api.ts`.
"
