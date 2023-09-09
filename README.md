This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

a webportal to upload “.unl” formatted files and convert data into different formats.

# **Stack:**

- NextJs 13
- Postgresql as a database
- Tailwind
- tanstack react query

# **features:**

- Insert the .unl file in a database with drag and drop upload
- The inserted data can be manipulated by delete, insert en modify.
- Export the .unl file to PDF and mail to anyone as an attachment
- Export the .unl file to CSV mail to anyone as an attachment
- Export the .unl file to JSON mail to anyone as an attachment
- Simple role based access control for the above functionality
