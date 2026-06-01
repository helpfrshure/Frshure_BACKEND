# FRSHURE Backend API

Student Jobs Marketplace Platform — Production-ready Node.js/Express backend with MongoDB Atlas, JWT auth, Razorpay payments, Firebase realtime, and Cloudinary uploads.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (access + refresh tokens), BCrypt |
| Payments | Razorpay Node SDK |
| Realtime | Firebase Realtime Database, Socket.IO |
| Uploads | Multer → Cloudinary |
| Docs | Swagger / OpenAPI 3.0 |
| Logging | Winston + Morgan |
| Security | Helmet, CORS, Rate Limiting, XSS, Validation |
| Testing | Jest + Supertest |
| Deployment | Docker, PM2 Cluster, Nginx |

---

## Project Structure

```
backend-nodejs/
├── src/
│   ├── config/          # DB, Firebase, Cloudinary, Razorpay, Logger
│   ├── constants/        # Enums, roles, statuses, fees
│   ├── models/           # Mongoose schemas (10 models)
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   ├── controllers/      # Request handlers
│   ├── routes/           # Express routers (v1)
│   ├── middlewares/      # Auth, roles, error, upload, rate limit
│   ├── validators/       # express-validator rules
│   ├── utils/            # Response helpers, token helpers
│   ├── socket/           # Socket.IO realtime
│   ├── firebase/         # Firebase service wrapper
│   ├── swagger/          # OpenAPI spec
│   ├── app.js            # Express app setup
│   └── server.js         # Entry point
├── tests/                # Jest test suites
├── Dockerfile
├── docker-compose.yml
├── pm2.config.js
├── nginx.conf
└── package.json
```

Architecture: **Routes → Controllers → Services → Repositories → Database** (strict layering, no business logic in routes or controllers).

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas URI
- Razorpay account
- Cloudinary account
- Firebase Admin SDK service account

### Installation

```bash
git clone <repo-url>
cd backend-nodejs
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | At least 32 chars |
| `JWT_REFRESH_SECRET` | At least 32 chars |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `FIREBASE_PRIVATE_KEY` | Firebase service account key |

---

## API Endpoints

Base URL: `/api/v1`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/refresh-token` | Refresh JWT access token |
| PUT | `/change-password` | Change password (authenticated) |

### Student

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/student/signup` | Register new student |
| POST | `/student/login` | Student login |
| POST | `/student/logout` | Student logout |
| GET | `/student/profile` | Get student profile |
| PUT | `/student/profile` | Update student profile |
| GET | `/student/applications` | Get student applications |
| GET | `/student/saved-jobs` | Get saved jobs |
| POST | `/student/save-job/:jobId` | Save a job |
| DELETE | `/student/unsave-job/:jobId` | Unsave a job |

### Employer

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/employer/signup` | Register new employer (requires admin approval) |
| POST | `/employer/login` | Employer login |
| POST | `/employer/logout` | Employer logout |
| GET | `/employer/profile` | Get employer profile |
| PUT | `/employer/profile` | Update employer profile |
| GET | `/employer/dashboard` | Employer dashboard stats |
| GET | `/employer/analytics` | Employer analytics |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/jobs/create` | Create job posting (employer, requires payment) |
| GET | `/jobs` | List all active jobs |
| GET | `/jobs/search` | Search jobs (q, city, jobType, skills, salary) |
| GET | `/jobs/filter` | Filter jobs |
| GET | `/jobs/:jobId` | Get job details |
| PUT | `/jobs/update/:jobId` | Update job (employer) |
| DELETE | `/jobs/delete/:jobId` | Delete job (employer) |
| POST | `/jobs/apply/:jobId` | Apply for job (student) |
| GET | `/jobs/applicants/:jobId` | Get job applicants (employer) |

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/application/accept/:applicationId` | Accept application (employer) |
| PUT | `/application/reject/:applicationId` | Reject application (employer) |
| GET | `/application/:id` | Get application details |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/list` | Get chat conversations |
| GET | `/chat/messages/:chatId` | Get chat messages |
| POST | `/chat/send` | Send a message |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get user notifications |
| PUT | `/notifications/read/:id` | Mark notification as read |
| DELETE | `/notifications/delete/:id` | Delete notification |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment/create-order` | Create Razorpay order |
| POST | `/payment/verify` | Verify payment |
| POST | `/payment/webhook` | Razorpay webhook |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Admin dashboard |
| GET | `/admin/employers` | List employers |
| PUT | `/admin/approve/:id` | Approve employer |
| PUT | `/admin/reject/:id` | Reject employer |
| GET | `/admin/users` | List all users |
| DELETE | `/admin/user/:id` | Delete user |
| GET | `/admin/analytics` | Platform analytics |

---

## Payment Flow

1. Employer creates a job → status = INACTIVE
2. Employer calls `/payment/create-order` with jobId
3. Frontend initiates Razorpay checkout with returned `razorpayOrderId`
4. On success, frontend calls `/payment/verify` with payment details
5. Backend verifies signature → marks payment PAID → activates job
6. Webhook endpoint handles async Razorpay events (optional)

---

## Authentication Flow

1. Signup → returns `accessToken` (15min) + `refreshToken` (7 days)
2. Include `Authorization: Bearer <accessToken>` in all protected requests
3. When access token expires, call `/refresh-token` with `refreshToken`
4. Change password at `/change-password`

---

## Testing

```bash
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode
```

Tests cover:
- Student registration, login, duplicate email, validation
- Employer registration, login after approval
- Token refresh, invalid tokens
- Job CRUD, search, authorization enforcement

---

## Deployment

### Docker

```bash
docker-compose up -d --build
```

### PM2 (Production)

```bash
npm install -g pm2
pm2 start pm2.config.js --env production
pm2 save
pm2 startup
```

### Nginx

The included `nginx.conf` provides:
- SSL/TLS termination
- Reverse proxy to Node.js app
- WebSocket support for Socket.IO
- Gzip compression
- Security headers
- Rate limiting

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in all production credentials
3. Set `NODE_ENV=production`
4. Use PM2 cluster mode for multi-core

---

## Security

- Helmet for HTTP headers
- CORS restricted to configured origins
- JWT with short-lived access tokens
- BCrypt (12 rounds) for password hashing
- express-rate-limit on auth routes
- Input validation on all endpoints
- File upload size & type validation
- No secrets in code (all via env vars)
- Webhook signature verification
- Idempotency protection on payments

---

## Brands & Support

- **Email:** helpfrshure@gmail.com
- **Instagram:** https://www.instagram.com/frshure.in
- **LinkedIn:** https://www.linkedin.com/company/frshure/

---

## License

ISC — FRSHURE
