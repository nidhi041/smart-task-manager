const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const search = document.getElementById("search");
const filters = document.querySelectorAll(".filters button");
const prioritySelect = document.getElementById("priority");
const themeToggle = document.getElementById("theme-toggle");

// Load tasks safely
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
tasks = tasks.filter(t => t.text); // remove any broken entries

let currentFilter = "all";

// Save tasks
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks
    .filter(task => {
      if (currentFilter === "all") return true;
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "pending") return !task.completed;
    })
    .filter(task => (task.text || "").toLowerCase().includes(search.value.toLowerCase()));

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";
    li.innerHTML = `
      <div class="task-info">
        <span>${task.text}</span>
        <small class="priority">Priority: ${task.priority || 'Pending'}</small>
        <small class="date">Added: ${task.date || 'N/A'}</small>
      </div>
      <div class="actions">
        <button onclick="toggleTask(${index})">${task.completed ? "↩️" : "✅"}</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Add task
function addTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  if (!text) return alert("Please enter a task!");

  const date = new Date().toLocaleString();

  tasks.push({ text, priority, date, completed: false });
  taskInput.value = "";
  saveTasks();
  renderTasks();
}

// Toggle complete
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Filter buttons
filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Search input
search.addEventListener("input", renderTasks);

// Add task button
addTaskBtn.addEventListener("click", addTask);

// Enter key to add
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Initial render
renderTasks();
