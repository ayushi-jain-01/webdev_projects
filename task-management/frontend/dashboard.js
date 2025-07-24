let editingIndex = null;

const dropdownBtnNotes = document.querySelector(".dropdown-btn-notes");
if (dropdownBtnNotes) {
  dropdownBtnNotes.addEventListener("click", function () {
    const dropdown = this.parentElement;
    dropdown.classList.toggle("active");
  });
}

window.onload = function() {
  showSection('dashboard'); // load dashboard by default
};

// toggle sidebar
const toggleBtn = document.getElementById("toggleSidebarBtn");
const sidebar = document.getElementById("sidebar");
const container = document.querySelector(".container");
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
  container.classList.toggle("with-sidebar");
  container.classList.toggle("full-width");
});
document.addEventListener("click", (e) => {
  const clickedInsideSidebar = sidebar.contains(e.target);
  const clickedToggleBtn = toggleBtn.contains(e.target);

  if (!clickedInsideSidebar && !clickedToggleBtn && !sidebar.classList.contains("hidden")) {
    sidebar.classList.add("hidden");
    container.classList.add("full-width");
  }
});


// Section toggler
window.showSection = function(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach(section => section.style.display = 'none');

  const targetSection = document.getElementById(sectionId);
  if(targetSection){
    targetSection.style.display = 'block';
  }

  if (sectionId === 'viewNotes'){
    fetchAndRenderNotes();
  }else if(sectionId === 'dashboard'){
    renderDashboardSummary();
  }
}

// Token helper
function getToken() {
  return localStorage.getItem('token');
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn){
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});
}

// dashboard
function renderDashboardSummary() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;

  document.getElementById("taskSummary").innerHTML = `
  <div class="dash-content">
    <h3>Task Summary</h3>
    <p>✅ Completed: ${completed}</p>
    <p>🔄 In-Progress: ${inProgress}</p>
    <p>🕓 Pending: ${pending}</p>
  </div>
  `;

  // Notes count
  fetch(`${BASE_URL}/api/notes`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then(res => res.json())
    .then(notes => {
      document.getElementById("noteSummary").innerHTML = `
        <h3>Notes Summary</h3>
        <p>Total Notes: ${notes.length}</p>
      `;
    })
    .catch(err => {
      console.error("Failed to fetch notes:", err);
      document.getElementById("noteSummary").innerHTML = `
        <h3>Notes Summary</h3>
        <p>Error loading notes</p>
      `;
    });

  // Upcoming Tasks by dueDate
  const upcoming = tasks
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 2);

  const upcomingHTML = upcoming.length > 0
    ? upcoming.map(t => `<p>📅 ${t.title} - Due: ${new Date(t.dueDate).toLocaleDateString()}</p>`).join("")
    : "<p>No upcoming tasks</p>";

  document.getElementById("upcomingTasks").innerHTML = `
    <h3>Upcoming Tasks</h3>
    ${upcomingHTML}
  `;
}

// notes backend
let notes = [];
let editingId = null;

// Save or Update Note
document.getElementById("noteForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const noteTitle = document.getElementById("noteTitle").value.trim();
  const noteContent = document.getElementById("noteContent").value.trim();

  if (!noteTitle || !noteContent) {
    alert("Please fill both fields");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Not logged in!");
    return;
  }

  console.log("Sending note:", {
    title: noteTitle,
    content: noteContent
  });

  try {
    const url = editingId
    ? `${BASE_URL}/api/notes/${editingId}`
    : `${BASE_URL}/api/notes`;
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        title: noteTitle,
        content: noteContent
      })
    });

    if (!response.ok) throw new Error("Failed to save note");

    alert(editingId ? "Note updated!" : "Note saved!");

    document.getElementById("noteForm").reset();
    document.querySelector("#noteForm button[type='submit']").textContent = "Save Note";

    fetchAndRenderNotes();
    showSection("viewNotes")
  } catch (err) {
    console.error(err);
    alert("Error saving note");
  }
});

// Fetch and show saved notes from backend
async function fetchAndRenderNotes() {
  const container = document.getElementById("savedNotesContainer");
  if (!container) return;

  container.innerHTML = "<p>Loading notes...</p>";
  const token = localStorage.getItem("token");

  console.log("Token being sent:",token);

  if (!token) {
    container.innerHTML = "<p>You must be logged in to view notes.</p>";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/notes`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Failed to fetch notes");
    notes = await res.json();

    container.innerHTML = "";

    if (notes.length === 0) {
      container.innerHTML = "<p>No notes saved.</p>";
      return;
    }

    notes.forEach((note, index) => {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note-box";
      noteDiv.innerHTML = `
        <div class="note-card">
          <h3>Title: ${note.title}</h3>
          <p>Content: ${note.content}</p>
          <div class="note-buttons">
            <button onclick="editNote(${index})"><i class="fas fa-edit"></i></button>
            <button onclick="deleteNote('${note._id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
      container.appendChild(noteDiv);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading notes</p>";
  }
}

// Edit Note (frontend only – creates a new note with updated content)
function editNote(index) {
  const note = notes[index];
  document.getElementById("noteTitle").value = note.title;
  document.getElementById("noteContent").value = note.content;
  editingId = note._id;
  showSection("createNote");
  document.querySelector("#noteForm button[type='submit']").innerHTML = `<i class="fas fa-pen-to-square"></i>`;

}

// Delete Note from backend
async function deleteNote(noteId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Not logged in!");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/notes/${noteId}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Failed to delete");

    alert("Note deleted!");
    fetchAndRenderNotes();
  } catch (err) {
    console.error(err);
    alert("Error deleting note");
  }
}

// Show notes section and fetch notes
function handleViewNotes() {
  showSection("viewNotes");
  fetchAndRenderNotes();
}

// DOM ELEMENT
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const sortBy = document.getElementById("sortBy");
let currentFilter ="all";

// Create Task
if (taskForm) {
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status").value;
    const dueDate = document.getElementById("dueDate").value;
    const token = getToken();
    const taskId = taskForm.dataset.editing;

    if (!title) return alert("Title is required!");

    try {
      const res = await fetch(
        taskId ? `${BASE_URL}/api/task/${taskId}` : `${BASE_URL}/api/task`,
        {
          method: taskId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description, status, dueDate }),
        }
      );

      const data = await res.json();
      console.log("Response data:", data);
      
      if (!res.ok) throw new Error(data.message || "Request failed");

      alert(taskId ? "Task updated successfully" : "Task created successfully");

      const localTasks = JSON.parse(localStorage.getItem("tasks")) || [];

      if (taskId){
        const index = localTasks.findIndex(t => t._id === taskId);
        if (index !== -1) localTasks[index] ={ ...localTasks[index], title, description, status, dueDate};
      } else{
        localTasks.push(data.task || data);
      }

      localStorage.setItem("tasks",JSON.stringify(localTasks));

      // Reset form & remove editing flag
      taskForm.reset();
      delete taskForm.dataset.editing;

      loadTasks();
      showSection("viewTasks");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    }
  });
}

// Sort dropdown
if (sortBy) {
  sortBy.addEventListener("change", () =>{
    loadTasks();
  });
}

// Filter buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.status;
    loadTasks();
  });
});

// View Tasks (load tasks fro api)
async function loadTasks() {
  try {
    const token = getToken();
    const sortValue = sortBy ? sortBy.value : 'latest';

    const queryParams = new URLSearchParams();
    if (sortValue) queryParams.append("sortBy",sortValue);
    if (currentFilter && currentFilter !== "all") queryParams.append("status",currentFilter);

    // const res = await fetch(`${BASE_URL}/api/task?sortBy=${sortValue}`, {
    const res = await fetch(`${BASE_URL}/api/task?${queryParams.toString()}`, {
      headers: {
        "Content-Type":"application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await res.json();

    if (res.status ==401){
      alert("Unauthorized. Please login again");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok){
      console.warn("Error loading tasks: ",res.status,data);
      alert(data.message || "Failed to load tasks");
      return;
    }

    if (!Array.isArray(data)){
      console.error("Unexpected data format:",data);
      alert("unexpected response format. Please try again.");
      return;
    }

    window.currentTasks = data;

    localStorage.setItem("tasks",JSON.stringify(data));

    renderDashboardSummary();
    displayTasks(data);

  } catch (err) {
    console.error("Error loading tasks:",err);
    alert("An unexpected error occures while loading tasks.");
  }
}

// display tasks
function displayTasks(tasks) {
  taskList.innerHTML = "";

  const filteredTasks =
  currentFilter === "all"
  ? tasks
  : tasks.filter((task) => task.status.toLowerCase() === currentFilter.toLowerCase());

  if (!filteredTasks.length) {
    taskList.innerHTML = "<p> No Tasks Found </p>";
    return;
  }

  filteredTasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";

    card.innerHTML = `
    <div class="task-card">
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p>Status: ${task.status}</p>
      <p>Due: ${new Date(task.dueDate).toLocaleDateString()}</p>
      <div class="task-buttons">
      <button onclick="editTask('${task._id}')"> <i class="fas fa-edit"> </i></button>
      <button onclick="deleteTask('${task._id}')"><i class="fas fa-trash-alt"></i> </button>
      ${task.status !== 'completed'
        ? `<button onclick="markCompleted('${task._id}')"><i class="fas fa-check"> </i></button>`
        : ''
      }
      </div>
    </div>
    `;
    taskList.appendChild(card);
  });
}

// edit taks
window.editTask = function(taskId) {
  const task = window.currentTasks.find((t) => t._id === taskId);
  if (!task) {
    alert("Task not found!");
    return;
  }

  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("status").value = task.status;
  document.getElementById("dueDate").value = task.dueDate
  ? new Date(task.dueDate).toISOString().split('T')[0]
  : "";

  document.getElementById("createTaskBtn").innerHTML = `<i class="fas fa-pen-to-square"></i>`;


  // Set editing flag
  taskForm.dataset.editing = taskId;

  // Switch to Create Task section
  showSection("createTask");
};

// Delete Task
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    const res = await fetch(`${BASE_URL}/api/task/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (res.ok) {
      await loadTasks();
      renderDashboardSummary();
    }else{
      const error = await res.json();
      alert(`Failed to delete task: ${error.message || res.statusText}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting task")
  }
}

// mark completed
window.markCompleted = async function(taskId) {
  try {
    const res = await fetch(`${BASE_URL}/api/task/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: "completed" }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to mark task as completed");

    alert("Task marked as completed!");
    loadTasks(); // Refresh task list
  } catch (err) {
    console.error("Error marking task as completed:", err);
    alert("Something went wrong while marking task as completed");
  }
};

// ====== Initial load ======
window.addEventListener("DOMContentLoaded", () => {
  const token = getToken();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  loadTasks();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filtered = window.currentTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
      displayTasks(filtered, currentFilter); // keep current filter
    });
  }  
});
