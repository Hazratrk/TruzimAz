document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");

    // Form submit
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        errorMsg.textContent = "";

        const emailOrUsername = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

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
                errorMsg.textContent = "Yanlış email/istifadəçi adı və ya şifrə!";
                return;
            }

            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                registeredAt: user.createdAt || new Date().toISOString(),
            };

            localStorage.setItem("loggedInUser", JSON.stringify(userData));
            window.location.href = "index.html";
        } catch (error) {
            console.error("Login Error:", error);
            errorMsg.textContent = "Xəta baş verdi, zəhmət olmasa yenidən cəhd edin.";
        }
    });
});
