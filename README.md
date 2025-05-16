# Comment Event System

A web application that displays and manages team event data with quality metrics and custom comment support. Built with **Next.js**, **Tailwind CSS**, and connected to a **SQL Server** database hosted on Azure.

---

## 🧩 Features

- ✅ Fetches and displays event data from an Azure-hosted SQL Server
- ✅ Lists all available database tables
- ✅ Client-side rendering using `use client` in Next.js
- ✅ Fully styled with Tailwind CSS
- ✅ Built to deploy on Azure Static Web Apps
- ✅ Extensible for adding comments and notes to events

---

## ⚙️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend (API):** Next.js Route Handlers (`/api/comments`)
- **Database:** SQL Server (`vorne-sql-db` on Azure)
- **Hosting:** Azure Static Web Apps + Azure SQL

---

## 📁 Project Structure

```

├── src
│   └── app
│       ├── comments          # Route handling logic
│       │   └── route.ts      # SQL connection + data API
│       └── page.tsx          # Frontend React rendering
├── public                    # Static assets
├── .env.local               # Environment variables
├── tailwind.config.ts
└── README.md
```

# **Setup & Deployment**

**1. Clone the repo**

git clone https://github.com/your-username/comment-event-system.git

cd comment-event-system

**2. Install dependencies**

npm install

**3. Add environment variables**

Create a .env.local file with your database credentials:

DB_USER=usrChatBot

DB_PASS=Catalyst-Absence-Retrace5

DB_SERVER=demo.oeeintellisuite.com

DB_NAME=vorne-sql-db

**4. Run locally**

npm run dev

Access the app at: http://localhost:3000
