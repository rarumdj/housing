# HouseHunt

Monorepo: `backend` (Express + Sequelize + MySQL), `frontend` (Vite + React).

## Quick start

### Docker (frontend + API + MySQL + Adminer)

```bash
cp .env.docker.example .env.docker   # optional
npm run docker:up
```

- App: http://localhost:5173
- API: http://localhost:4000
- Database UI: http://localhost:8080 (Adminer)
- Full guide: **[DOCKER.md](./DOCKER.md)**

### XAMPP (local Sequelize)

```bash
cp backend/.env.example backend/.env
npm run db:migrate
npm run dev
```

- API: http://localhost:4000
- Database UI: http://localhost/phpmyadmin

Details: **[DOCKER.md](./DOCKER.md)** (XAMPP section)
