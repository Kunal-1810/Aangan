# Aangan – rent & buy listings (MERN, Vercel-ready)

React (Vite) frontend + Express/MongoDB API in one repo. The API runs as a Vercel serverless function (`api/index.js`); auth uses a JWT in an httpOnly cookie, so no server memory is needed.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill in `MONGODB_URI` (MongoDB Atlas) and `JWT_SECRET`
3. `npm run dev` → web on http://localhost:5173, API on http://localhost:5000

Create an account with "List my property" to post listings.

## Deploy on Vercel
1. Push this folder to a GitHub repo
2. In Vercel: Add New → Project → import the repo (framework preset: Vite; no other settings needed)
3. Add environment variables: `MONGODB_URI`, `JWT_SECRET`
4. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (Vercel uses changing IPs)
5. Deploy. Check `https://<your-app>.vercel.app/api/health`

## Structure
```
api/index.js          Vercel function entry
server/               Express app: routes, models, auth middleware, db
src/                  React app (pages, api helper, auth context)
vercel.json           Routes /api/* to the function, everything else to the SPA
```

## Roadmap
Week 2 Cloudinary image upload + owner dashboard · Week 3 favorites, detail page · Week 4 map search, inquiries, visit requests, admin approval · Week 5 tests, Docker, polish
