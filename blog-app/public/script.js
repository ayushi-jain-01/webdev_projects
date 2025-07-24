let editId = null;

function getToken() {
  return localStorage.getItem('token');
}

// LOGIN FUNCTION
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data); // Debug: See what backend returns

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      console.log("Token saved to localStorage:", data.token);

      alert("Login successful!");
      
      toggleLoginLogout(); // Toggle UI based on login state
      document.querySelector(".auth-sidebar").classList.add("hidden");
      fetchBlogs();        // Load blogs again

      // Optional: Clear form or redirect
      document.getElementById("loginEmail").value = "";
      document.getElementById("loginPassword").value = "";

    } else {
      alert("Login response missing token.");
      console.warn("No token in response:", data);
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong during login.");
  }
}

// logout
function logout() {
  localStorage.removeItem("token");
  alert("Logged out.");
  toggleLoginLogout();
  fetchBlogs();
}

// LOGIN/LOGOUT UI TOGGLE

function toggleLoginLogout() {
  const token = getToken();
  const authBtn = document.getElementById("authToggleBtn");

  if (authBtn) {
    authBtn.textContent = token ? "Logout" : "Login";
  }
}

// to-right button click handler
function toggleAuthForm() {
  const token = getToken();
  const sidebar = document.querySelector(".auth-sidebar");

  if (token) {
    logout();
    sidebar.classList.add("hidden");
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Toggle sidebar visibility
  const isHidden = sidebar.classList.contains("hidden");
  sidebar.classList.toggle("hidden", !isHidden); // Show if hidden

  // Always show login form when opening
  if (isHidden) {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  }
}

// show registerform
function showRegister() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}

// show login form
function showLogin() {
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

// register
async function register() {
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!name || !email || !password) {
    return alert("Please fill all fields");
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Registration failed");
      return;
    }

    alert("Registration successful! You can now log in.");
  } catch (err) {
    console.error("Registration error:", err);
    alert("Something went wrong during registration.");
  }
}

// Show/hide/clear blog form
function showCreateForm() {
  document.getElementById("createForm").classList.remove("hidden");
}
function hideCreateForm() {
  document.getElementById("createForm").classList.add("hidden");
  clearForm();
  editId = null;
}
function clearForm() {
  document.getElementById("newTitle").value = "";
  document.getElementById("newContent").value = "";
  document.getElementById("newAuthor").value = "";
}

function closeModal() {
  document.getElementById("blogModal").classList.add("hidden");
}

function showAbout() {
  document.getElementById('aboutModal').classList.remove('hidden');
}

function showContact() {
  document.getElementById('contactModal').classList.remove('hidden');
}

function showAbout(event) {
  event.preventDefault();
}

function showContact(event) {
  event.preventDefault();
}

function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function closeBlogModal() {
  const modal = document.getElementById("blogModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// fetch blogs
async function fetchBlogs() {
  console.trace("fetchBlogs called");
  const token = getToken();
  const wrapper = document.getElementById("blogsWrapper");
  wrapper.innerHTML = "";

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload._id || payload.userID || payload.id || null;
      console.log("Decoded UserID: ",userId);
    } catch (err) {
      console.error("Token decode failed:", err);
    }
  }

  try {
    const res = await fetch("/api/blogs", { headers });
    if (!res.ok) {
      const error = await res.text();
      console.error("blog fetch error:",error);
      alert("Failed to fetch Blogs");
      return;
    }

    const blogs = await res.json();
    console.log("fetched blogs from api:",blogs);
    console.log("Current logged-in userID: ",userId);

    blogs.forEach(blog => {
      console.log("Rendering blog: ",blog);

      const title = blog.title || "Untitled";
      const content = blog.content || "No content";
      const author = blog.author || "Unknown";
      const isStatic = blog.isStatic;

      // const blogUserId = blog.userID?._id || blog.userID || "").toString();
      const blogUserId = blog.userID ? blog.userID.toString(): "";
      const isEditable = userId && blogUserId === userId && !isStatic;

      const card = document.createElement("div");
      card.classList.add("blog-card");
      card.innerHTML = `
        <h3>${title}</h3>
        <p>${content.length > 100 ? content.substring(0, 100) + '...' : content}</p>
        <small><b> Author:</b> ${author}</small>
        <div class="blog-buttons">
          <button class="view-btn" onclick="viewBlog('${blog._id}')"><i class="fas fa-eye"></i></button>
          ${isEditable ? `
            <button class="edit-btn" onclick="editBlog('${blog._id}')"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" onclick="deleteBlog('${blog._id}')"><i class="fa fa-trash"></i></button>
          ` : ""}
        </div>
      `;
      wrapper.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    alert("Failed to load blogs.");
  }
}

// Createblog
async function addBlog() {
  const title = document.getElementById("newTitle").value.trim();
  const content = document.getElementById("newContent").value.trim();
  const author = document.getElementById("newAuthor").value.trim();

  if (!title || !content || !author) {
    alert("Please fill all fields.");
    return;
  }

  const blogData = { title, content, author };

  try {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    };

    const res = await fetch(
      editId ? `/api/blogs/${editId}` : "/api/blogs",
      {
        method: editId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(blogData)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to save blog");
      return;
    }

    alert(editId ? "Blog updated!" : "Blog created!");
    hideCreateForm();
    fetchBlogs();
  } catch (err) {
    console.error("Blog submit error:", err);
    alert("Blog submit failed.");
  }
}

// Viewblog
async function viewBlog(id) {
  const token= getToken();
  console.log("Sending token in header: ",token)
  const headers = token ? { Authorization : `Bearer ${token}`} :{}
  try {
    const res = await fetch(`/api/blogs/${id}`,{headers});

    if (!res.ok) {
      const error = await res.json();
      alert("Failed to fetch blog: " + (error.error || res.status));
      return;
    }

    const blog = await res.json();
    console.log("Blog Data: ",blog);

    // alert(
    //   `📄 Title: ${blog.title || "No Title"}\n` +
    //   `📝 Content: ${blog.content || "No Content"}\n` +
    //   `👤 Author: ${blog.author || "Unknown"}`
    // );

    const modalContent = `
    <div class="card">
      <h3> 📄 Title: ${blog.title || "No Title"} </h3>
      <p> 📝 Content: ${blog.content || "No Content"}</p>
      <p> <strong>👤 Author: ${blog.author || "Unknown"}</p>
    </div>
    `;

    const container = document.getElementById("modalCardContent");
    if (!container){
      console.error(" Card content not found")
      return;
    }

    container.innerHTML = modalContent;
    document.getElementById("blogModal").classList.remove("hidden");

  } catch (err) {
    console.error("Error viewing blog:", err);
    alert("Unexpected error occurred while viewing blog");
  }
}

// Edit blog
async function editBlog(id) {
  try {
    const res = await fetch(`/api/blogs/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!res.ok) {
      alert("Error loading blog for editing");
      return;
    }

    const blog = await res.json();
    document.getElementById("newTitle").value = blog.title || "";
    document.getElementById("newContent").value = blog.content || "";
    document.getElementById("newAuthor").value = blog.author || "";

    editId = id; // store globally for later update
    showCreateForm();

  } catch (err) {
    console.error("Unexpected error fetching blog:", err);
    alert("Unexpected error loading blog for editing");
  }
}

// Delete blog
async function deleteBlog(id) {
  if (!confirm("Are you sure you want to delete this blog?")) return;

  try {
    const res = await fetch(`/api/blogs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    alert("Blog deleted");
    fetchBlogs();
  } catch (err) {
    console.error("Delete blog error:", err);
  }
}

// onLoginSuccess();

window.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');  
  document.querySelector(".auth-sidebar").classList.add("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.add("hidden");

  toggleLoginLogout();
  fetchBlogs();
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('open');
  });
});