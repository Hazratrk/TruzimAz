// Navbar 
function updateNavbar() {
    const authSection = document.getElementById('authSection');
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    if (user) {
      
        authSection.innerHTML = `
            <li class="relative">
                <div class="flex items-center space-x-2 cursor-pointer group" id="profileDropdownBtn">
                    <img src="${user.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg'}" 
                         class="w-8 h-8 rounded-full border-2 border-blue-100">
                    <span class="group-hover:text-blue-800">${user.username || 'Profil'}</span>
                    <i class="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
                </div>
                <div id="profileDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                        <i class="fas fa-user mr-2"></i>Profilim
                    </a>
                    <a href="my-rentals.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                        <i class="fas fa-home mr-2"></i>My rental
                    </a>
                    <div class="border-t border-gray-200"></div>
                    <button onclick="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                        <i class="fas fa-sign-out-alt mr-2"></i>Çıxış
                    </button>
                </div>
            </li>
        `;

        // Dropdown 
        const dropdownBtn = document.getElementById('profileDropdownBtn');
        const dropdown = document.getElementById('profileDropdown');

        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            dropdown.classList.add('hidden');
        });
    }
}


function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

// Səhifə yüklənəndə navbarı yenilə
document.addEventListener('DOMContentLoaded', updateNavbar);