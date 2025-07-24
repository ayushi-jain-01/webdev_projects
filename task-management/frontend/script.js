BASE_URL = ""
document.addEventListener("DOMContentLoaded", () => {
  const pathname = window.location.pathname;

  // ----------------- INDEX PAGE -----------------
  if (pathname.includes("index.html") || pathname.endsWith("/")) {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    loginBtn?.addEventListener("click", () => {
      window.location.href = "login.html";
    });

    registerBtn?.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  // ----------------- REGISTER PAGE -----------------
  if (pathname.includes("register.html")) {

    const registerForm = document.getElementById("registerForm");

    registerForm?.addEventListener("submit",async  (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
          mode: "cors"
        });

        const data = await res.json();
        if (res.ok) {
          alert("Registration successful! Please log in.");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (err) {
        console.error(err);
        alert("Error during registration");
      }
    });
  }

  // ----------------- LOGIN PAGE -----------------
  if (pathname.includes("login.html")) {

    const loginForm = document.getElementById("loginForm")

    loginForm.addEventListener("submit",async(e) => { e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          mode: "cors"
        });

        const data = await res.json();
        console.log("Login response",data);

        if (res.ok && data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "dashboard.html";
        } else {
          console.warn("Login failed. Response data:", data);
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login request failed", err);
        alert("Error during login. Please try again.");
      }
    });
  }
});

