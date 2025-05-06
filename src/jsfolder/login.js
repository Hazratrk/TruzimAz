document
  .getElementById("loginForm")
  .addEventListener("LogIn", async function (e) {
    e.preventDefault();

    const usernameInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    try {
      const response = await fetch("http://localhost:8000/users");
      const users = await response.json();

      const user = users.find(
        (u) => u.username === usernameInput && u.password === passwordInput
      );

      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "/login.html";
      } else {
        errorMsg.textContent = "Invalid username or password";
      }
    } catch (err) {
      console.error("Login error:", err);
      errorMsg.textContent = "An error occurred. Please try again later.";
    }
  });
