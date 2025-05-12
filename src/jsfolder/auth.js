document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();
    document.getElementById('logoutBtn')?.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        window.location.href = '../login.html';
    });
});

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const authSection = document.getElementById('authSection');

    if (authSection) {
        if (currentUser) {
            authSection.innerHTML = `
                <li class="flex items-center space-x-2 hover:text-blue-800 cursor-pointer">
                    <a href="profile.html" class="flex items-center space-x-2">
                        <i class="fa-solid fa-user-circle"></i>
                        <span>${currentUser.username}</span>
                    </a>
                </li>
                <li class="flex items-center space-x-2 hover:text-blue-800 cursor-pointer">
                    <a href="#" id="logoutBtn" class="flex items-center space-x-2">
                        <i class="fa-solid fa-sign-out-alt"></i>
                        <span>Quit</span>
                    </a>
                </li>
            `;
        } else {
            authSection.innerHTML = `
                <li class="flex items-center space-x-2 hover:text-blue-800 cursor-pointer">
                    <a href="login.html" class="flex items-center space-x-2">
                        <i class="fa-solid fa-user"></i>
                        <span>Login</span>
                    </a>
                </li>
                <li class="flex items-center space-x-2 hover:text-blue-800 cursor-pointer">
                    <a href="register.html" class="flex items-center space-x-2">
                        <i class="fa-solid fa-user-plus"></i>
                        <span>Register</span>
                    </a>
                </li>
            `;
        }
    }
}
