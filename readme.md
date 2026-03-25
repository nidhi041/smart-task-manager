# 🚀 Smart Task Manager (Full-Stack)

A modern, elegant, and fully functional **Full-Stack Task Management Web App** that helps users efficiently manage daily tasks with persistent storage and a responsive UI.

Originally built as a frontend-only application, this project was **upgraded to a full-stack system** using **Node.js, Express, and MongoDB**, replacing localStorage with a scalable backend.

---

## 🌐 Live Demo

*(Add your deployed link here once available)*

---

## ✨ Features

### 🎯 Core Features

✅ Add new tasks easily
✅ Mark tasks as completed or pending
✅ Delete tasks with a single click
✅ Filter tasks by status (All / Pending / Completed)
✅ Search tasks dynamically

### 🎨 UI/UX Features

✅ Responsive and modern UI
✅ Light/Dark theme toggle
✅ Smooth animations and minimalistic design

### ⚙️ Backend Features (NEW 🚀)

✅ RESTful API integration
✅ Persistent storage using MongoDB
✅ Replace localStorage with database
✅ Real-time data sync between frontend & backend

---

## 🧠 Tech Stack

### 🎨 Frontend

| Technology                | Purpose                      |
| ------------------------- | ---------------------------- |
| HTML5                     | Structure & layout           |
| CSS3 (Flexbox, Variables) | Styling, layout, dark mode   |
| Vanilla JavaScript (ES6)  | DOM manipulation & API calls |

### ⚙️ Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Runtime environment |
| Express.js | Backend framework   |
| MongoDB    | Database            |
| Mongoose   | ODM for MongoDB     |

---

## 📁 Folder Structure

```
smart-task-manager/
│
├── client/              # Frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/             # Backend
│   ├── server.js
│   ├── models/
│   ├── routes/
│   └── .env
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint       | Description        |
| ------ | -------------- | ------------------ |
| GET    | /api/tasks     | Get all tasks      |
| POST   | /api/tasks     | Create a new task  |
| PUT    | /api/tasks/:id | Toggle task status |
| DELETE | /api/tasks/:id | Delete a task      |

---

## ⚙️ How to Run Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/smart-task-manager.git
cd smart-task-manager
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

---

### 3️⃣ Run Frontend

* Open `client/index.html` using **Live Server**

---

## 🔄 Project Evolution

This project was enhanced from:

➡️ **Frontend-only (localStorage-based)**
➡️ **Full-stack application with database & APIs**

Key improvements:

* Introduced backend architecture
* Implemented REST APIs
* Migrated from localStorage → MongoDB
* Enabled persistent and scalable data handling

---

## 💡 Future Enhancements

* 🔐 User authentication (JWT)
* 📅 Add due dates and reminders
* 📊 Dashboard analytics (Total / Completed / Pending)
* ☁️ Cloud database (MongoDB Atlas)
* 🌍 Full deployment (Render + Netlify)
* 📱 Mobile-first UI improvements

---

## 🧠 Learning Outcomes

* Built RESTful APIs using Express
* Integrated frontend with backend
* Managed data using MongoDB
* Understood full-stack architecture and data flow

---

## 🤝 Contribution

Feel free to fork this repo and improve it!

---

## 📌 Author

**Your Name**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub — it helps!
