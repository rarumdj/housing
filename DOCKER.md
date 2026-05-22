# Running HouseHunt with Docker or XAMPP

The API uses **Sequelize** and **MySQL** in both setups. Pick one database at a time:

| Setup      | MySQL host                                            | MySQL port (host)  | API                         |
| ---------- | ----------------------------------------------------- | ------------------ | --------------------------- |
| **Docker** | Container `mysql` (API) / `127.0.0.1` (from your Mac) | **3307**           | http://localhost:5173 (app), http://localhost:4000 (API) |
| **XAMPP**  | `localhost`                                           | **3306** (default) | `npm run dev` in `backend/` |

Docker MySQL uses **3307** on your machine so it does not clash with XAMPP on **3306**.

---

## Docker (frontend + API + MySQL + Redis + Adminer)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- Node is **not** required on your machine — everything runs in containers

### 1. Optional env file

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` for JWT secrets and third-party keys. Compose already sets DB host/user/password for the API container.

### 2. Start everything

From the **project root**:

```bash
npm run docker:up
```

Detached (background):

```bash
npm run docker:up:detached
```

On first start, the API container waits for MySQL, runs **Sequelize migrations**, then starts. The frontend proxies `/api` to the API container.

### 3. URLs

| Service                                | URL                          |
| -------------------------------------- | ---------------------------- |
| **App (frontend)**                     | http://localhost:5173        |
| API (direct)                           | http://localhost:4000        |
| Health check                           | http://localhost:4000/health |
| **Database UI (Adminer)**              | http://localhost:8080        |
| MySQL from host (TablePlus, CLI, etc.) | `127.0.0.1:3307`             |

### 4. Adminer login (Docker database)

Open http://localhost:8080 and use:

| Field    | Value                                                     |
| -------- | --------------------------------------------------------- |
| System   | MySQL                                                     |
| Server   | `mysql`                                                   |
| Username | `root`                                                    |
| Password | `root` (or your `MYSQL_ROOT_PASSWORD` from `.env.docker`) |
| Database | `house_hunt`                                              |

> If Adminer is opened from outside Docker and `mysql` does not resolve, use server **`host.docker.internal`** (Docker Desktop on Mac/Windows) or connect via host port: server **`127.0.0.1`**, port **`3307`**.

### 5. Useful commands

```bash
# Follow API + frontend logs
npm run docker:logs

# API or frontend only
npm run docker:logs:api
npm run docker:logs:frontend

# Run migrations again inside the API container
npm run docker:migrate

# Stop and remove containers (keeps MySQL data volume)
npm run docker:down

# Stop and delete database volume (fresh DB)
docker compose down -v
```

The frontend uses Vite’s proxy (`/api` → `http://api:4000` inside Docker). You normally open **http://localhost:5173** only.

---

## XAMPP + Sequelize (local, no Docker for API)

Use this when you prefer **phpMyAdmin** and MySQL on port **3306**.

### 1. XAMPP

1. Start **Apache** and **MySQL** in XAMPP.
2. Create database `house_hunt` in phpMyAdmin: http://localhost/phpmyadmin  
   (or run `CREATE DATABASE house_hunt;` in the SQL tab.)

### 2. Backend env

```bash
cp backend/.env.example backend/.env
```

Ensure these match XAMPP (defaults):

```env
DATABASE=house_hunt
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
```

### 3. Migrations and API

```bash
# From project root
npm run db:migrate

# Or from backend with explicit "local" env
npm run db:migrate:local --workspace=backend

# Start API only
npm run dev --workspace=backend

# Or API + frontend together
npm run dev
```

API: http://localhost:4000

Database UI: http://localhost/phpmyadmin → database `house_hunt`

### 4. Sequelize CLI envs

| Command                                         | Config env    | When to use                 |
| ----------------------------------------------- | ------------- | --------------------------- |
| `npm run db:migrate`                            | `development` | XAMPP / local `.env`        |
| `npm run db:migrate:local --workspace=backend`  | `local`       | Same as above (alias)       |
| `npm run db:migrate:docker --workspace=backend` | `docker`      | Host → Docker MySQL on 3307 |

Migrate from your Mac **against Docker MySQL** (API not running):

```bash
DB_HOST=127.0.0.1 DB_PORT=3307 DB_USER=root DB_PASSWORD=root DATABASE=house_hunt \
  npm run db:migrate:docker --workspace=backend
```

---

## Switching between Docker and XAMPP

- **Do not run both MySQL servers on the same host port.** Docker uses **3307**; XAMPP uses **3306**.
- They use **separate data**: Docker data lives in the `mysql_data` volume; XAMPP uses its own `mysql/data` folder.
- To use XAMPP again: `npm run docker:down`, start XAMPP MySQL, use `backend/.env` with `DB_PORT=3306`, run `npm run dev --workspace=backend`.
- To use Docker again: stop XAMPP MySQL (optional), `npm run docker:up`.

---

## Troubleshooting

| Problem                  | What to try                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| Port 3307 in use         | Change `MYSQL_HOST_PORT` in `.env.docker`                                |
| Port 4000 in use         | Change `API_HOST_PORT` in `.env.docker`                                  |
| Port 5173 in use         | Change `FRONTEND_HOST_PORT` in `.env.docker`                             |
| Frontend can’t reach API | Ensure both containers are up; check `npm run docker:logs:frontend`      |
| API starts but DB errors | `npm run docker:logs` — check migrations; `npm run docker:migrate`       |
| Empty database           | `docker compose down -v` then `npm run docker:up` (wipes Docker DB)      |
| XAMPP “can’t connect”    | Confirm MySQL is running; `DB_PASSWORD` matches your XAMPP root password |

Redis is optional for basic API usage; without it, background video jobs are skipped (see `backend/src/app/utils/queue.ts`).
