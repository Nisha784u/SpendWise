# SpendWise — Smart Expense Tracker

A full stack personal finance app with AI-powered spending insights, budget alerts, and a Flutter mobile app.


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
| 

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
├── backend/                
│   ├── models/             
│   ├── routes/             
│   ├── middleware/         
│   └── server.js          
│
├── frontend/              
│   └── src/
│       ├── pages/          
│       ├── components/     
│       ├── context/        
│       └── utils/          
│
└── flutter_app/            
    └── lib/
        ├── screens/        
        └── services/      
```

---

## ⚙️ Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
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
flutter run
```



