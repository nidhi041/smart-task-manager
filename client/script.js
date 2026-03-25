const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const search = document.getElementById("search");
const filters = document.querySelectorAll(".filters button");
const prioritySelect = document.getElementById("priority");
const themeToggle = document.getElementById("theme-toggle");

const API = "http://localhost:5000/api/tasks";

let tasks = [];
let currentFilter = "all";

// 🔥 FETCH TASKS FROM BACKEND
async function fetchTasks() {
  const res = await fetch(API);
  tasks = await res.json();
  renderTasks();
}

// 🎨 Render tasks
function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks
    .filter(task => {
      if (currentFilter === "all") return true;
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "pending") return !task.completed;
    })
    .filter(task =>
      (task.title || "").toLowerCase().includes(search.value.toLowerCase())
    );

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    li.innerHTML = `
      <div class="task-info">
        <span>${task.title}</span>
        <small class="priority">Priority: ${task.priority || "N/A"}</small>
        <small class="date">Added: ${
          task.createdAt
            ? new Date(task.createdAt).toLocaleString()
            : "N/A"
        }</small>
      </div>
      <div class="actions">
        <button onclick="toggleTask('${task._id}')">
          ${task.completed ? "↩️" : "✅"}
        </button>
        <button onclick="deleteTask('${task._id}')">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// ➕ Add task
async function addTask() {
  const title = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (!title) return alert("Please enter a task!");

  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      priority,
      completed: false
    })
  });

  taskInput.value = "";
  fetchTasks();
}

// ✅ Toggle task
async function toggleTask(id) {
  await fetch(`${API}/${id}`, {
    method: "PUT"
  });

  fetchTasks();
}

// ❌ Delete task
async function deleteTask(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE"
  });

  fetchTasks();
}

// Filters
filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Search
search.addEventListener("input", renderTasks);

// Add button
addTaskBtn.addEventListener("click", addTask);

// Enter key
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// 🚀 INITIAL LOAD
fetchTasks();