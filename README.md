# 💰 SpendWise — Smart Expense Tracker

A full stack personal finance app with AI-powered spending insights, budget alerts, and a Flutter mobile app.

**Live Demo:** [Deploy to Vercel] | **GitHub:** [Push your repo]

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js, REST API |
| Database | MongoDB (Atlas) |
| Auth | JWT (JSON Web Tokens) |
| Auth Provider | Supabase (optional) |
| AI | Google Gemini API |
| Mobile | Flutter + Dart |
| Deployment | Vercel (frontend), Render (backend) |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with token-based sessions
- 💸 **Expense Tracking** — Add, edit, delete expenses with 8 categories
- 📊 **Interactive Dashboard** — Pie chart + bar chart with Recharts
- 🎯 **Budget Alerts** — Set monthly limits, get warned at 80% usage
- 🤖 **AI Insights** — Gemini API analyzes your spending and gives tips
- 📱 **Flutter Mobile App** — Full iOS/Android app using the same backend
- 🗓️ **Monthly Filtering** — View any month's data at a glance

---

## 📁 Project Structure

```
spendwise/
├── backend/                 # Node.js + Express REST API
│   ├── models/             # MongoDB schemas (User, Expense, Budget)
│   ├── routes/             # API routes (auth, expenses, budgets, ai)
│   ├── middleware/         # JWT auth middleware
│   └── server.js           # Entry point
│
├── frontend/               # React + Tailwind web app
│   └── src/
│       ├── pages/          # Dashboard, Expenses, Budgets, Login, Register
│       ├── components/     # Layout, sidebar
│       ├── context/        # AuthContext (global auth state)
│       └── utils/          # Axios API instance
│
└── flutter_app/            # Flutter mobile app
    └── lib/
        ├── screens/        # Login, Home, AddExpense screens
        └── services/       # API service (http calls)
```

---

## ⚙️ Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY in .env
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### 3. Flutter App

```bash
cd flutter_app
flutter pub get
# Update baseUrl in lib/services/api_service.dart
flutter run
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get expenses (filter by month/year/category) |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/summary` | Category totals for a month |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get budgets with spent % |
| POST | `/api/budgets` | Create/update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/summary` | Get AI spending analysis |

---

## 🚢 Deployment

### Backend → Render (Free)
1. Push to GitHub
2. Go to render.com → New Web Service
3. Connect your repo, set root to `backend/`
4. Add environment variables from `.env`
5. Build: `npm install` | Start: `node server.js`

### Frontend → Vercel (Free)
1. Go to vercel.com → Import project
2. Set root to `frontend/`
3. Add env: `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy!

---

## 🔑 Getting API Keys

- **MongoDB Atlas**: Free at mongodb.com/atlas
- **Gemini API**: Free at aistudio.google.com (get API key)

---

## 📝 Resume Bullet Points

> Built a full stack expense tracking application (web + mobile) using React.js, Node.js, MongoDB, and Flutter, featuring JWT authentication, real-time budget alerts, Recharts dashboards, and AI-powered spending insights via the Google Gemini API. Deployed frontend on Vercel and backend on Render.

---

Built by Nisha | B.Tech Software Engineering (Full Stack AI), UPES Dehradun
