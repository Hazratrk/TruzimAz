// LocalStorage
let user = JSON.parse(localStorage.getItem('loggedInUser'));

if (!user) {
    window.location.href = '/login.html';
} else {
    // Initialize on load
    document.addEventListener('DOMContentLoaded', function () {
        displayProfileInfo();
        loadRentHistory();
        updateNavbarProfile();
        loadUserRentals();
    });
}

// Profile info göstərişi
function displayProfileInfo() {
    document.getElementById('profileImage').src = user.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg';
    document.getElementById('userFullname').textContent = `${user.fullname || ''} ${user.lastname || ''}`.trim();
    document.getElementById('userEmail').textContent = user.email || 'example@gmail.com';
    document.getElementById('balanceAmount').textContent = user.balance || 0;

    const joinDate = new Date(user.registeredAt);
    document.getElementById('memberSince').textContent = `Üzv olub: ${joinDate.toLocaleDateString('az-AZ')}`;

    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('memberDuration').textContent = `${diffDays} gün`;
}

// Rent tarixçəsini yüklə
function loadRentHistory() {
    fetch(`http://localhost:8000/reservations?userId=${user.id}`)
        .then(res => res.json())
        .then(rents => {
            const rentHistory = document.getElementById('rentHistory');

            if (rents.length === 0) {
                rentHistory.innerHTML = '<p class="text-gray-500 text-center">Hələ ki, rent tarixçəniz yoxdur</p>';
                return;
            }

            let html = '';
            let totalSpent = 0;

            rents.forEach(rent => {
                totalSpent += rent.totalPrice || 0;
                html += `
                    <div class="flex justify-between items-center py-4">
                        <div>
                            <p class="font-semibold text-blue-600">${rent.apartmentTitle || 'Apartments'}</p>
                            <p class="text-gray-500 text-sm">${rent.startDate} - ${rent.endDate}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">${rent.totalPrice || 0} AZN</p>
                            <p class="text-sm ${rent.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}">
                                ${rent.status === 'completed' ? 'Tamamlandı' : 'Gözləyir'}
                            </p>
                        </div>
                    </div>
                `;
            });

            rentHistory.innerHTML = html;
            document.getElementById('totalRents').textContent = rents.length;
            document.getElementById('totalSpent').textContent = `${totalSpent} AZN`;
        })
        .catch(err => {
            console.error('Rent tarixçəsi yüklənərkən xəta:', err);
        });
}

// Balans artırma
function openAddBalanceModal() {
    document.getElementById('addBalanceModal').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function addBalance() {
    const amount = parseFloat(document.getElementById('addAmount').value);

    if (isNaN(amount) || amount < 5) {
        alert('Minimum 5 AZN artırmaq mümkündür!');
        return;
    }

    user.balance = (user.balance || 0) + amount;
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: user.balance })
    })
    .then(res => {
        if (!res.ok) throw new Error('Balance not updated');
        displayProfileInfo();
        closeModal('addBalanceModal');
        alert('Balans uğurla artırıldı!');
    })
    .catch(err => {
        console.error('Balance increase error:', err);
        alert('Xəta baş verdi, yenidən yoxlayın.');
    });
}

// Logout funksiyası
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/login.html';
}

// Navbar üçün profil məlumatı
function updateNavbarProfile() {
    if (user) {
        document.getElementById('navbarProfileImg').src = user.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg';
        document.getElementById('navbarUsername').textContent = user.username || 'Profil';
    }
}

// Navbar dropdown açıb-bağlama
document.getElementById('profileDropdownBtn').addEventListener('click', function () {
    document.getElementById('profileDropdown').classList.toggle('hidden');
});

document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('profileDropdown');
    const btn = document.getElementById('profileDropdownBtn');
    if (!btn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// İstifadəçinin rezervasiyalarını yüklə
function loadUserRentals() {
    fetch(`http://localhost:8000/reservations?userId=${user.id}`)
        .then(res => res.json())
        .then(rentals => {
            const rentalsContainer = document.getElementById('userRentals');

            if (rentals.length === 0) {
                rentalsContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-home text-4xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">Hələlik heç bir kirayəniz yoxdur</p>
                    </div>
                `;
                return;
            }

            let html = rentals.map(rental => `
                <div class="border-b border-gray-200 py-4">
                    <div class="flex justify-between">
                        <div>
                            <h4 class="font-medium text-blue-700">${rental.apartmentTitle || 'Məlum deyil'}</h4>
                            <p class="text-sm text-gray-500">${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">${rental.totalPrice || 0} AZN</p>
                            <span class="inline-block px-2 py-1 text-xs rounded-full 
                                ${rental.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                ${rental.status === 'completed' ? 'Tamamlandı' : 'Gözləyir'}
                            </span>
                        </div>
                    </div>
                    <div class="mt-2 flex justify-between text-sm">
                        <span class="text-gray-600">Rezervasiya ID: ${rental.id}</span>
                        <a href="#" class="text-blue-600 hover:underline">Ətraflı bax</a>
                    </div>
                </div>
            `).join('');

            rentalsContainer.innerHTML = html;
        })
        .catch(err => {
            console.error('Rezervasiyalar yüklənərkən xəta:', err);
        });
}

// Tarix formatı
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('az-AZ', options);
}

// Əlavə funksiya (placeholder)
function openWithdrawModal() {
    alert('Hazırlanır...');
}
