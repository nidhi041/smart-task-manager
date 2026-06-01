# Smart Task Manager (Full-Stack + Analytics)

A **modern, full-stack productivity web app** designed to help users manage tasks, track performance, and build consistency using **streaks, analytics, and smart insights**.

Originally built using **HTML, CSS, and JavaScript**, this project was later **upgraded to a scalable React + Node.js + MongoDB system**, transforming it into a **feature-rich productivity platform**.

---

## Live Demo

*(Add your deployed link here)*
Demo Credentials: *(optional)*

---

## Features

### Core Task Management

*  Add, update, and delete tasks
*  Categorize tasks: **Planning / Pending / Completed**
*  Real-time task updates
*  Search and filter tasks dynamically

---

###  Productivity & Analytics (Highlight)

*  Weekly & Monthly performance reports
*  Visual charts for task completion trends
*  Streak tracking system for consistency
*  Productivity Score calculation
*  Smart insights based on user activity

---

### UI/UX Experience

*  Clean, minimal, and modern dashboard
*  Light / Dark mode toggle
*  Smooth animations and transitions
*  Fully responsive design
*  Empty state handling for better UX

---

### Authentication & User System

*  User signup & login
*  Personalized dashboard per user
*  Profile management (name, image, etc.)
*  Secure session handling

---

### Backend & System Features

*  RESTful API architecture
*  MongoDB database integration
*  Persistent data (no localStorage)
*  Scalable backend with Express.js

---

## Tech Stack

### Frontend

| Technology          | Purpose                     |
| ------------------- | --------------------------- |
| React (Vite)        | UI development              |
| Tailwind CSS        | Styling & responsive design |
| JavaScript (ES6+)   | Logic & state handling      |
| Recharts / Chart.js | Data visualization          |

---

### Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Runtime environment |
| Express.js | Backend framework   |
| MongoDB    | Database            |
| Mongoose   | ODM                 |

---

## Folder Structure

```
smart-task-manager/
│
├── backend/             # Express + MongoDB API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/            # React (Vite) App
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## API Endpoints

| Method | Endpoint       | Description   |
| ------ | -------------- | ------------- |
| GET    | /api/tasks     | Get all tasks |
| POST   | /api/tasks     | Create task   |
| PUT    | /api/tasks/:id | Update task   |
| DELETE | /api/tasks/:id | Delete task   |

---

## How to Run Locally

### 1️. Clone Repository

```bash
git clone https://github.com/your-username/smart-task-manager.git
cd smart-task-manager
```

---

### 2️. Setup Backend

```bash
cd backend
npm install
npm run dev
```

---

### 3️. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

##  Project Evolution

This project evolved through multiple stages:

 **Basic Task Manager (HTML/CSS/JS + localStorage)**
 **Full-Stack App (Node.js + MongoDB)**
 **Advanced Productivity System (React + Analytics + Streaks)**

---

##  Future Enhancements

*  AI-based task recommendations
*  Smart notifications & reminders
*  Team collaboration features
*  Advanced productivity insights
*  Mobile app version

---

## Learning Outcomes

* Built a complete **MERN stack application**
* Designed scalable backend architecture
* Implemented authentication & protected routes
* Developed analytics dashboards with charts
* Focused on real-world **UI/UX and product thinking**

---

## Author

**Built by Nidhi**

---

## If you like this project

Give it a ⭐ on GitHub — it really helps!
