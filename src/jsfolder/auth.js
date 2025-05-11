document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Çıxış funksionallığı
    document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('currentAdmin');
        window.location.href = '../login.html';
    });
});

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    const authSection = document.getElementById('authSection');

    if (authSection) {
        if (currentUser || currentAdmin) {
          
            const user = currentUser || currentAdmin;
            
            authSection.innerHTML = `
                <li class="flex items-center space-x-2 hover:text-blue-800 cursor-pointer">
                    <a href="${user.role === 'admin' ? 'admin/dashboard.html' : 'profile.html'}" 
                       class="flex items-center space-x-2">
                        <i class="fa-solid fa-user-circle"></i>
                        <span>${user.username}</span>
                    </a>
                </li>
                <li class="flex items-center space-x-2 hover:text-blue-800 cursor-pointer">
                    <a href="#" id="logoutBtn" class="flex items-center space-x-2">
                        <i class="fa-solid fa-sign-out-alt"></i>
                        <span>Çıxış</span>
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

    
    if (window.location.pathname.includes('/admin/')) {
        if (!currentAdmin || currentAdmin.role !== 'admin') {
            window.location.href = '../login.html';
        }
    }
}
