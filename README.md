# Saud Dashboard Backend

This repository contains the backend for the Saud business dashboard. It is a small Node.js/Express application using PostgreSQL and Prisma ORM.

## Getting started

Follow these steps to run the project locally.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18+ (or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker](https://www.docker.com/) if you plan to run the database in a container (recommended)

### 2. Clone the repository

```bash
git clone <repo-url>
cd saud-work
```

### 3. Install dependencies

```bash
npm install
```

### 4. Environment variables

Copy the example file and fill in any values as needed:

```bash
cp .env.example .env
```

The backend expects the following variables:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/saud_dashboard?schema=public
PORT=3000    # or any port you prefer
```

Adjust the `DATABASE_URL` if you are connecting to a different host/port/user/password.

### 5. Start the database

You can run a local Postgres instance using Docker Compose:

```bash
docker compose up -d
```

This will start a Postgres server listening on port `5434` as configured in `docker-compose.yml`.

If you prefer to run Postgres another way, make sure the connection string in `.env` points to a running database.

### 6. Run Prisma migrations

Generate the client and apply migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will create the necessary tables defined in `prisma/schema.prisma`.

### 7. Launch the server

For production-style start:

```bash
npm start
```

For development (automatic restart on changes):

```bash
npm run dev
```

By default the server will listen on the port defined in `PORT` (3000 if unset).

### 8. API routes

The Express app exposes several routes under `/` for:

- `/goals`
- `/projects`
- `/tasks`
- `/sections`
- `/knowledge`
- `/completions`
- `/snapshots`
- `/strategic-focus`

Each route is defined in the `routes/` directory.

### 9. Using Prisma Studio

You can inspect the database with:

```bash
npm run prisma:studio
```

### 10. Troubleshooting

- Ensure Docker is running when starting the database.
- Verify `.env` values if the app cannot connect to Postgres.
- Check `server.js` for startup logs and errors.

---

Feel free to modify or extend the application as needed. If you plan to deploy, make sure to set the appropriate environment variables for production and secure your Postgres credentials.