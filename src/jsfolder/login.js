document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  const userLoginBtn = document.getElementById("userLoginBtn");
  const adminLoginBtn = document.getElementById("adminLoginBtn");
  const loginTypeInput = document.getElementById("loginType");
  const loginTitle = document.querySelector("h2");

  // User login seçimi
  userLoginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    loginTypeInput.value = "user";
    userLoginBtn.classList.add("bg-blue-600", "text-white");
    userLoginBtn.classList.remove("bg-gray-200", "hover:bg-gray-300");
    adminLoginBtn.classList.add("bg-gray-200", "hover:bg-gray-300");
    adminLoginBtn.classList.remove("bg-blue-600", "text-white");
    loginTitle.textContent = "User Login";
  });

  // Admin login seçimi
  adminLoginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    loginTypeInput.value = "admin";
    adminLoginBtn.classList.add("bg-blue-600", "text-white");
    adminLoginBtn.classList.remove("bg-gray-200", "hover:bg-gray-300");
    userLoginBtn.classList.add("bg-gray-200", "hover:bg-gray-300");
    userLoginBtn.classList.remove("bg-blue-600", "text-white");
    loginTitle.textContent = "Admin Login";
  });

  // Form submit
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorMsg.textContent = "";

    const emailOrUsername = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const isAdminLogin = loginTypeInput.value === "admin";

    if (!emailOrUsername || !password) {
      errorMsg.textContent = "Bütün xanaları doldurun!";
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/users");
      if (!response.ok) throw new Error("API işləmir");

      const users = await response.json();

      // İstifadəçini tap
      const user = users.find(
        (u) =>
          (u.email === emailOrUsername || u.username === emailOrUsername) &&
          u.password === password
      );

      if (!user) {
        errorMsg.textContent = "Incorrect email/username or password!";
        return;
      }

      // Admin login
      if (isAdminLogin && user.role !== "admin") {
        errorMsg.textContent = "Only admins can access here!";
        return;
      }

      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        role: user.role || "user",
        registeredAt: user.createdAt || new Date().toISOString(),
      };

      localStorage.setItem("loggedInUser", JSON.stringify(userData));

      if (user.role === "admin") {
        localStorage.setItem("currentAdmin", JSON.stringify(userData));
        window.location.href = "admin/dashboard.html"; // Admin panelə yönləndir
      } else {
        window.location.href = "index.html"; // İstifadəçi səhifəsinə yönləndir
      }
    } catch (error) {
      console.error("Login Error:", error);
      errorMsg.textContent = "An error occurred, please try again.";
    }
  });
});
