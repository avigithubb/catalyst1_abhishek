<<<<<<< HEAD
# Elderly Care & Medication Management Platform

An interconnected healthcare management and adherence tracking platform engineered for elderly individuals, caretakers, and authorized family circles.

---

## 🏛️ Monorepo Architecture Overview

The repository is structured as a TypeScript monorepo with workspace package separation:

```text
elderly-healthcare/
├── apps/
│   ├── web/                     # React 18 + Vite + Tailwind CSS Frontend
│   └── api/                     # Node.js + Express + PostgreSQL Backend
├── packages/
│   ├── shared-types/            # Canonical TypeScript types & interfaces
│   ├── shared-utils/            # Formatters, date math, validation helpers
│   ├── ui/                      # Reusable headless/styled UI components
│   └── api-client/              # Strongly-typed HTTP API client
├── .env                         # Centralized environment variables
├── pnpm-workspace.yaml          # PNPM workspace root configuration
└── tsconfig.base.json           # Shared TypeScript base configuration
```

---

## 🚀 Key Features

1. **Shared Family Ecosystem & Passcode Security**
   - Single patient dossier accessible by multiple authorized roles: **Patient**, **Family Caregiver**, **Doctor**, and **Nurse**.
   - Passcode verification (`access_passcode`) ensures only authenticated members can view and alter prescriptions.

2. **Authentication & Session Security**
   - Passwords hashed using **Bcrypt** with configurable salt rounds.
   - Stateless **JWT session tokens** passed via `Authorization: Bearer <token>`.
   - React `AuthContext` provides session propagation, eliminating prop-drilling.

3. **Elderly Health Dashboard**
   - **Current Health Condition**: Real-time vital signs (BP, Heart Rate, Blood Sugar).
   - **Adherence Streak Counter**: Gamified streak tracker highlighting continuous compliance.
   - **Daily Medication Checklist**: Instant one-click toggle for morning, afternoon, and evening doses.
   - **Daily Physical Exercise Tracker**: Mobility, stretching, chair yoga, and breathing therapy routines.

4. **Automated Missed-Medication Email Engine**
   - **Single-Day Miss (Yesterday Due)**: If any dose was left due yesterday, an alert email is sent **only** to the patient, and the adherence streak resets.
   - **Critical Overdue (> 2 Consecutive Days)**: If medication is missed for 2+ consecutive days, an urgent alert email is automatically dispatched to **all** registered family members and doctors.

5. **ACID-Compliant PostgreSQL Schema**
   - Atomic transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) on all medication state transitions.
   - `LEFT JOIN` batch queries avoiding the **N+1 query vulnerability**.

---

## 💻 Quick Start Guide

### 1. Configure Environment
A default `.env` file is prepared in the workspace root:
```ini
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/elderly_care_db
JWT_SECRET=super_secret_elderly_care_jwt_key_2026_xyz
```

### 2. Initialize Database & Run Seed
```bash
pnpm --filter api db:init
```

### 3. Run Development Servers
```bash
# Start frontend web app
pnpm --filter web dev

# Start backend REST API
pnpm --filter api dev
```
Navigate to `http://localhost:3000` to access the application.

---

## 🔒 Security Audit & Vulnerabilities Covered

### Vulnerabilities Covered:
- **Plaintext Credential Leaks**: Mitigated using salted Bcrypt hashing (`bcrypt.hash`).
- **Session Hijacking & CSRF**: Controlled via signed JSON Web Tokens (JWT) with strict expiration.
- **SQL Injection**: Neutralized via parameterized queries (`$1, $2, ...`) across all PostgreSQL operations.
- **N+1 Query Flaw**: Mitigated using consolidated relational `LEFT JOIN` queries for medication schedules.
- **Unauthorized Data Snooping**: Enforced via combined role checks and shared account passcodes.

### Recommended Additional Security Features:
1. **Time-Based One-Time Password (TOTP / 2FA)**: Two-factor authentication via Authenticator apps.
2. **Field-Level Encryption at Rest (`pgcrypto`)**: Encrypting sensitive diagnoses and clinical notes directly in the database.
3. **Immutable HIPAA Audit Trail**: Write-once log capturing every view and update to medical records.
4. **Rate Limiting & Brute-Force Throttling**: Implementing `express-rate-limit` with Redis for failed login attempts.
=======
# catalyst1_abhishek
An app for elderly individuals to make and manage their medications and track records.
>>>>>>> e7cc12adeb1318c9183ca0e85272eb167af2447c
