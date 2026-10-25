This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Accounts and admin

- Anyone can browse listings. Adding a home requires an account: `/register`, then `/login`, which returns you to the add-home form.
- Owners can edit or delete only their own listings (`/my-listings`). Every check runs on the server in `utils/actions.ts`, using `lib/auth.ts`.
- Registration always creates regular users. To make an existing account the admin (this also gives it any listings with no owner):

  ```bash
  npm run make-admin -- someone@example.com            # grant
  npm run make-admin -- someone@example.com --revoke   # remove
  ```

- The admin dashboard is at `/admin`; other users get a 404 there.

## Demo listings

48 demo listings, 4 per category, use the openly licensed photos in `public/images/categories`
(sources and licenses in `ATTRIBUTION.md` there). They're owned by the admin account. Photos have no credit captions; every photo is credited on the Image credits
page (`/credits`), linked from the footer. Only CC BY 4.0, CC BY-SA 4.0, CC0 and public-domain
photos may be used, since those licenses allow that (the tests check this).

```bash
npm run seed-demo                          # add them, and update text of existing ones
npm run seed-demo -- someone@example.com   # add them owned by a specific account
npm run seed-demo -- --remove              # delete them, with their favorites and reservations
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
