# rabbitmq-log-pipeline

Real-time log pipeline built with RabbitMQ, Laravel and React. Events are published via a REST API, queued through RabbitMQ, persisted to PostgreSQL and streamed live to a React dashboard using WebSockets.

---

## Features

- **REST API** — Publish log events via `POST /api/logs`
- **Message broker** — RabbitMQ queues and delivers messages between services
- **Persistent storage** — Logs saved to PostgreSQL by the consumer
- **Real-time dashboard** — React frontend receives new logs instantly via WebSocket (Laravel Reverb)
- **Log history** — Dashboard loads previous logs from the database on startup
- **Log levels** — Supports `info`, `warning` and `error` with color-coded badges
- **Filters** — Filter logs by level in the dashboard

---

## Architecture

```
POST /api/logs
      ↓
 log-producer         (Laravel 13 — REST API)
      ↓
   RabbitMQ           (Message Broker — Docker)
      ↓
 log-consumer         (Laravel 13 — Worker + Reverb WebSocket)
   ↓        ↓
PostgreSQL  Reverb
              ↓
     log-dashboard    (React + Vite)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Producer API | Laravel 13 |
| Message Broker | RabbitMQ 3 |
| Consumer Worker | Laravel 13 |
| WebSocket | Laravel Reverb |
| Database | PostgreSQL |
| Frontend | React 19 + Vite |
| Container | Docker |

---

## Project Structure

```
rabbitmq-log-pipeline/
├── log-producer/       # Laravel API — receives and publishes events
├── log-consumer/       # Laravel Worker — consumes, saves and broadcasts
└── log-dashboard/      # React — real-time log viewer
```

---

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- Docker Desktop
- PostgreSQL

---

## RabbitMQ (Docker)

Start RabbitMQ before running any service:

```bash
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

Access the management panel at **http://localhost:15672**
- Login: `guest`
- Password: `guest`

To start an existing container:

```bash
docker start rabbitmq
```

---

## Producer Setup

```bash
cd log-producer
composer install
cp .env.example .env
php artisan key:generate
```

Configure `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=postgres
DB_PASSWORD=your_password

RABBITMQ_HOST=127.0.0.1
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

---

## Consumer Setup

```bash
cd log-consumer
composer install
cp .env.example .env
php artisan key:generate
```

Configure `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=logs
DB_USERNAME=postgres
DB_PASSWORD=your_password

RABBITMQ_HOST=127.0.0.1
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

BROADCAST_CONNECTION=reverb

REVERB_APP_ID=your_reverb_app_id
REVERB_APP_KEY=your_reverb_app_key
REVERB_APP_SECRET=your_reverb_app_secret
REVERB_HOST=localhost
REVERB_PORT=8081
REVERB_SCHEME=http
```

Create the database and run migrations:

```bash
php artisan migrate
```

---

## Dashboard Setup

```bash
cd log-dashboard
npm install
```

---

## Running the Project

You need **5 terminals** running simultaneously:

**1. RabbitMQ:**
```bash
docker start rabbitmq
```

**2. Producer API:**
```bash
cd log-producer
php artisan serve --port=8001
```

**3. Consumer Reverb WebSocket:**
```bash
cd log-consumer
php artisan reverb:start --port=8081
```

**4. Consumer Worker:**
```bash
cd log-consumer
php artisan logs:consume
```

**5. React Dashboard:**
```bash
cd log-dashboard
npm run dev
```

| Service | Address |
|---|---|
| Producer API | `http://localhost:8001` |
| Consumer API | `http://localhost:8002` |
| Reverb WebSocket | `ws://localhost:8081` |
| React Dashboard | `http://localhost:5173` |
| RabbitMQ Panel | `http://localhost:15672` |

---

## Publishing a Log Event

```bash
curl -X POST http://localhost:8001/api/logs \
  -H "Content-Type: application/json" \
  -d '{"service":"auth-service","level":"error","message":"Login failed"}'
```

**On Windows (PowerShell):**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8001/api/logs" -ContentType "application/json" -Body '{"service":"auth-service","level":"error","message":"Login failed"}'
```

**Payload fields:**

| Field | Type | Values |
|---|---|---|
| `service` | string | any service name |
| `level` | string | `info`, `warning`, `error` |
| `message` | string | any message |

---

## License

This project is open source and available under the [MIT License](LICENSE).
