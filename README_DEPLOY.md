# Quick deploy (free options)

Local quick test (build and run all services):

```bash
docker compose -f docker-compose.prod.yml up --build
```

Free hosted options (no custom domain required):

- Backend: Render (https://render.com) — create a new Web Service from this repo, select "Dockerfile" build, and set the Dockerfile path to `Dockerfile.backend`. Set `DATABASE_URL` in Render's environment to the managed DB or the connection string to a hosted Postgres.
- Frontend: Netlify (https://app.netlify.com/) or Render Static Site — point to the repository and let it build, or use the `Dockerfile.frontend` on Render.
- Postgres: use the provider's managed Postgres (Render/Railway) or keep the provided `db` service locally.

Minimal Render steps:

1. Create a free Render account and connect your GitHub repo.
2. Create a new "Web Service" → choose "Docker" and set path to `Dockerfile.backend`.
3. For the frontend create a static site on Netlify or a second Render service using `Dockerfile.frontend`.
4. (Optional) Use the provider's managed Postgres and set `DATABASE_URL` on the backend service.

Notes:
- This repo already contains `server.js` and `index_business.html`. The Dockerfiles `Dockerfile.backend` and `Dockerfile.frontend` were added to build each service.
- If you prefer a single free host, I can generate Render-specific service manifests or a single `docker-compose` + `traefik` setup.
