# The Sikh Tech Collective

An open platform for Sikh builders to share projects, connect with other engineers, and build for the Panth.

Live at [sikhtechcollective.com](https://sikhtechcollective.com)

## Features

- Browse and search projects built by the community
- Builder profiles with bios, skills, and project history
- Account creation with email confirmation
- Dashboard to submit and manage your own projects
- Google Auth (coming soon)
- Mobile responsive

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Database & Auth** — Supabase
- **Email** — Resend
- **Styling** — Tailwind CSS
- **Deployment** — Vercel

## Local Setup

```bash
git clone https://github.com/piramsingh/sikh-tech-collective.git
cd sikh-tech-collective

npm install
```

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Contributing

This is an open project. If you're a Sikh builder and want to contribute, open an issue or submit a PR.
