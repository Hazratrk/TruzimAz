// LocalStorage
let user = JSON.parse(localStorage.getItem('loggedInUser'));

if (!user) {
    window.location.href = '/login.html';
} else {
    // Profile
    displayProfileInfo();
    loadRentHistory();
}

function displayProfileInfo() {
    document.getElementById('profileImage').src = user.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg';
    document.getElementById('userFullname').textContent = `${user.fullname} ${user.lastname}`;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('balanceAmount').textContent = user.balance || 0;
    
    const joinDate = new Date(user.registeredAt);
    document.getElementById('memberSince').textContent = `Üzv olub: ${joinDate.toLocaleDateString()}`;
    
    
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    document.getElementById('memberDuration').textContent = `${diffDays} gün`;
}

function loadRentHistory() {
    // API-
    fetch(`http://localhost:8000/reservations?userId=${user.id}`)
        .then(response => response.json())
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
        .catch(error => {
            console.error('Rent tarixçəsi yüklənərkən xəta:', error);
        });
}

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
    
    // API
    fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ balance: user.balance })
    })
    .then(response => {
        if (!response.ok) throw new Error('Balance not updated');
        displayProfileInfo();
        closeModal('addBalanceModal');
        alert('Your balance has been succesfully increased!');
    })
    .catch(error => {
        console.error('Balance increase error:', error);
        alert('an error occurred,please check again.');
    });
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/login.html';
}

// Nümunə API strukturuna uyğun funksiyalar
function openWithdrawModal() {
    alert('Preparing');
}
// Update navbar profile info
function updateNavbarProfile() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
      document.getElementById('navbarProfileImg').src = user.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg';
      document.getElementById('navbarUsername').textContent = user.username || 'Profile';
    }
  }
  
  // Toggle profile dropdown
  document.getElementById('profileDropdownBtn').addEventListener('click', function() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('profileDropdown');
    const btn = document.getElementById('profileDropdownBtn');
    if (!btn.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.add('hidden');
    }
  });
  
  // Load user-specific rentals
  function loadUserRentals() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) return;
  
    fetch(`http://localhost:8000/reservations?userId=${user.id}`)
      .then(response => response.json())
      .then(rentals => {
        const rentalsContainer = document.getElementById('userRentals');
        
        if (rentals.length === 0) {
          rentalsContainer.innerHTML = `
            <div class="text-center py-8">
              <i class="fas fa-home text-4xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">You haven't made any rentals yet</p>
            </div>
          `;
          return;
        }
  
        let html = rentals.map(rental => `
          <div class="border-b border-gray-200 py-4">
            <div class="flex justify-between">
              <div>
                <h4 class="font-medium text-blue-700">${rental.apartmentTitle || 'Unknown Property'}</h4>
                <p class="text-sm text-gray-500">${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold">${rental.totalPrice || 0} AZN</p>
                <span class="inline-block px-2 py-1 text-xs rounded-full 
                  ${rental.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                  ${rental.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
            <div class="mt-2 flex justify-between text-sm">
              <span class="text-gray-600">Booking ID: ${rental.id}</span>
              <a href="#" class="text-blue-600 hover:underline">View Details</a>
            </div>
          </div>
        `).join('');
  
        rentalsContainer.innerHTML = html;
      });
  }
  
  // Helper function to format dates
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', function() {
    updateNavbarProfile();
    loadUserRentals();
    
    // Rest of your existing profile.js code...
  });