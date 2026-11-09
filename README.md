# 🌿 AgriVista Ventures

**Full-Stack Agriculture Management System**  
**Developer:** Huma Zafar · **Full Stack Developer Internship — Batch 6**  
**Organization:** U Devs (SMC-Private) Limited

AgriVista Ventures is a responsive farm management application built with React, Node.js, Express, and PostgreSQL. It brings agricultural operations, workforce management, expenses, and reporting into one dashboard.

## Tech Stack

| Frontend | Backend | Database |
| --- | --- | --- |
| React, Redux Toolkit, React Router | Node.js, Express, JWT authentication | PostgreSQL, Sequelize ORM |
| Material UI, Bootstrap, Recharts | REST APIs, role-based authorization | Persistent relational records |

**Additional integration:** Open-Meteo weather API.

## Features

- **Dashboard & weather:** Farm KPIs, crop health, harvest reminders, attendance summaries, equipment alerts, and live weather information.
- **Crops & harvest:** Manage crop records, health scores, field details, and cutting schedules.
- **Buyers & orders:** Buyer registration with CNIC, image-size and stock validations; order tracking and delivered-sales calculations.
- **Tasks & inventory:** Schedule farm tasks, track supplies, stock levels, usage history, and low-stock alerts.
- **Expenses & finance:** Record expenses, view revenue from delivered orders, and calculate profit or loss.
- **Workers & attendance:** Manage workers, record attendance, and calculate wages, including half-day rates.
- **Payroll:** Record monthly wage payments as Labour expenses, with checks against duplicate payments.
- **Equipment & maintenance:** Track machinery, service intervals, maintenance records, and associated costs.
- **Reports & activity:** View operational reports, export CSV, print/save PDF, and review activity history.
- **Authentication:** JWT-based login and protected API routes with **Admin** and **Manager** permissions.

## Project Structure

```text
agriculture-system/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handling
│   ├── middleware/       # Authentication and authorization
│   ├── models/           # Sequelize models and associations
│   ├── routes/           # REST API endpoints
│   ├── app.js
│   └── seed.js
├── public/
├── src/
│   ├── app/redux/       # Redux actions, API modules and reducers
│   ├── components/      # Pages, forms and reusable UI
│   ├── hooks/
│   ├── store/
│   └── App.js
├── package.json
└── README.md
```

## Local Setup

**Prerequisites:** Node.js, npm, PostgreSQL, and Git.

**1. Clone the repository**

```bash
git clone https://github.com/HumaZafar433/agrivista-ventures_huma.git
cd agrivista-ventures_huma
```

**2. Configure PostgreSQL**

Create a local PostgreSQL database named `agrivista_db`. Create `backend/.env` using the database connection settings and JWT secret expected by the backend configuration (`backend/config/db.js` and authentication code). Keep this file private; do not commit real credentials.

**3. Install dependencies and start the backend**

```bash
cd backend
npm install
npm run dev
```

For a fresh development database, run `npm run seed` if you need the project's sample records and test accounts. **Do not reseed a database containing data you need to keep.**

**4. Start the frontend in a separate terminal**

```bash
cd ..
npm install
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is blocked.

## Authentication & Data Flow

Admins can manage permitted records; Managers have restricted edit/delete access. Protected backend endpoints enforce authorization, including HTTP **403** for unauthorized operations.

```text
React UI → Redux / API request → Express route
        → Authentication / authorization → Sequelize
        → PostgreSQL → API response → Updated UI
```

Business records are stored through the backend and database rather than relying only on browser localStorage. Browser storage may still be used for session or UI state.

## Validation & Testing

The application supports buyer CNIC uniqueness checks, photo uploads limited to **1 MB**, stock quantity validation, protected routes, and confirmation before deletion. Test persistence by adding or updating a record and refreshing the page; also verify Admin/Manager permissions and payroll entries in Expenses.

## Security Notes

- Never commit `.env`, database credentials, JWT secrets, or local database dumps.
- `node_modules`, build outputs, and development backups should be excluded using `.gitignore`.
- The project is intended for internship development and demonstration, not as a production-hardened deployment.

---

**Developed by Huma Zafar**  
**GitHub:** https://github.com/HumaZafar433/agrivista-ventures_huma
