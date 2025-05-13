// adminapartments.js
document.addEventListener('DOMContentLoaded', function() {
    // Load all data when page loads
    loadDashboardData();
    
    // Form submission handler
    document.getElementById('addApartmentForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      await addNewApartment();
    });
  });
  
  // Global data store
  let dashboardData = {
    users: [],
    apartments: [],
    bookings: [],
    reviews: []
  };
  
  // Load all dashboard data
  async function loadDashboardData() {
    try {
      showLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, apartmentsRes, bookingsRes, reviewsRes] = await Promise.all([
        fetch('http://localhost:8000/users'),
        fetch('http://localhost:8000/apartments'),
        fetch('http://localhost:8000/bookings'),
        fetch('http://localhost:8000/reviews')
      ]);
      
      if (!usersRes.ok || !apartmentsRes.ok || !bookingsRes.ok || !reviewsRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      dashboardData = {
        users: await usersRes.json(),
        apartments: await apartmentsRes.json(),
        bookings: await bookingsRes.json(),
        reviews: await reviewsRes.json()
      };
      
      updateDashboardStats();
      renderApartmentsList();
      renderRecentBookings();
      renderRecentUsers();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showAlert('error', 'Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      showLoading(false);
    }
  }
  
  // Update dashboard statistics
  function updateDashboardStats() {
    document.getElementById('totalUsers').textContent = dashboardData.users.length;
    document.getElementById('activeUsers').textContent = dashboardData.users.filter(u => u.isActive).length;
    document.getElementById('totalApartments').textContent = dashboardData.apartments.length;
    document.getElementById('activeBookings').textContent = dashboardData.bookings.filter(b => b.status === 'active').length;
    document.getElementById('totalRevenue').textContent = 
      dashboardData.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0) + ' ₼';
  }
  
  // Render apartments list
  function renderApartmentsList() {
    const container = document.getElementById('apartmentsContainer');
    container.innerHTML = dashboardData.apartments.map(apartment => `
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <img src="${apartment.image}" alt="${apartment.title}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="font-bold text-lg mb-1">${apartment.title}</h3>
          <p class="text-gray-600 text-sm mb-2">
            <i class="fas fa-map-marker-alt text-teal-500 mr-1"></i>${apartment.location}
          </p>
          <p class="text-teal-600 font-bold mb-3">${apartment.nightPrice} ₼ / gecə</p>
          <div class="flex justify-between">
            <button onclick="editApartment('${apartment.id}')" 
                    class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-edit mr-1"></i>Düzəlt
            </button>
            <button onclick="deleteApartment('${apartment.id}')" 
                    class="text-red-600 hover:text-red-800">
              <i class="fas fa-trash mr-1"></i>Sil
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Render recent bookings
  function renderRecentBookings() {
    const container = document.getElementById('recentBookings');
    const recentBookings = dashboardData.bookings.slice(0, 5);
    
    container.innerHTML = recentBookings.map(booking => {
      const user = dashboardData.users.find(u => u.id === booking.userId) || {};
      const apartment = dashboardData.apartments.find(a => a.id === booking.apartmentId) || {};
      
      return `
        <div class="flex items-center p-3 hover:bg-gray-50">
          <div class="flex-shrink-0">
            <img src="${user.avatar || 'https://via.placeholder.com/40'}" 
                 class="w-10 h-10 rounded-full" alt="${user.name}">
          </div>
          <div class="ml-4 flex-1">
            <p class="font-medium">${user.name || 'İstifadəçi'}</p>
            <p class="text-sm text-gray-500">${apartment.title || 'Mənzil'}</p>
          </div>
          <div class="text-right">
            <p class="font-medium">${booking.totalPrice} ₼</p>
            <p class="text-sm ${booking.status === 'active' ? 'text-green-600' : 'text-gray-500'}">
              ${booking.status === 'active' ? 'Aktiv' : 'Tamamlanıb'}
            </p>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Render recent users
  function renderRecentUsers() {
    const container = document.getElementById('recentUsers');
    const recentUsers = dashboardData.users.slice(0, 5);
    
    container.innerHTML = recentUsers.map(user => `
      <div class="flex items-center p-3 hover:bg-gray-50">
        <div class="flex-shrink-0">
          <img src="${user.avatar || 'https://via.placeholder.com/40'}" 
               class="w-10 h-10 rounded-full" alt="${user.name}">
        </div>
        <div class="ml-4 flex-1">
          <p class="font-medium">${user.name}</p>
          <p class="text-sm text-gray-500">${user.email}</p>
        </div>
        <span class="px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
          ${user.isActive ? 'Aktiv' : 'Qeyri-aktiv'}
        </span>
      </div>
    `).join('');
  }
  
  // Add new apartment
  async function addNewApartment() {
    const form = document.getElementById('addApartmentForm');
    const apartmentData = {
      title: form.apartmentTitle.value.trim(),
      location: form.apartmentLocation.value.trim(),
      nightPrice: parseFloat(form.apartmentPrice.value),
      image: form.apartmentImage.value.trim(),
      description: form.apartmentDescription.value.trim(),
      features: [],
      rules: '',
      status: 'active'
    };
  
    try {
      showLoading(true);
      const response = await fetch('http://localhost:8000/apartments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apartmentData)
      });
  
      if (!response.ok) throw new Error('Failed to add apartment');
      
      const newApartment = await response.json();
      dashboardData.apartments.push(newApartment);
      
      updateDashboardStats();
      renderApartmentsList();
      form.reset();
      
      showAlert('success', 'Mənzil uğurla əlavə edildi!');
    } catch (error) {
      console.error('Error adding apartment:', error);
      showAlert('error', 'Mənzil əlavə edilərkən xəta baş verdi');
    } finally {
      showLoading(false);
    }
  }
  
  // Edit apartment
  async function editApartment(id) {
    // Implementation for editing an apartment
    console.log('Editing apartment:', id);
    // You would typically open a modal with the apartment data here
  }
  
  // Delete apartment
  async function deleteApartment(id) {
    if (!confirm('Bu mənzili silmək istədiyinizə əminsiniz?')) return;
    
    try {
      showLoading(true);
      const response = await fetch(`http://localhost:8000/apartments/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) throw new Error('Failed to delete apartment');
      
      dashboardData.apartments = dashboardData.apartments.filter(a => a.id !== id);
      updateDashboardStats();
      renderApartmentsList();
      
      showAlert('success', 'Mənzil uğurla silindi!');
    } catch (error) {
      console.error('Error deleting apartment:', error);
      showAlert('error', 'Mənzil silinərkən xəta baş verdi');
    } finally {
      showLoading(false);
    }
  }
  
  // UI Helper Functions
  function showLoading(show) {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.display = show ? 'block' : 'none';
    }
  }
  
  function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-md ${
      type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
    }`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
  
  // Make functions available globally
  window.editApartment = editApartment;
  window.deleteApartment = deleteApartment;