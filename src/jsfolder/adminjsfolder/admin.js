document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('adminName').textContent = 'Admin';
  
    document.getElementById('logoutBtn').addEventListener('click', function () {
      window.location.href = '/login.html';
    });
  
    loadDashboardData();
  });
  
  async function loadDashboardData() {
    try {
      const usersResponse = await fetch('http://localhost:8000/users');
      const bookingsResponse = await fetch('http://localhost:8000/bookings');
  
      if (!usersResponse.ok || !bookingsResponse.ok) throw new Error('Data fetch error');
  
      const users = await usersResponse.json();
      const bookings = await bookingsResponse.json();
  
      document.getElementById('totalUsers').textContent = users.length;
      document.getElementById('activeBookings').textContent = bookings.filter(b => b.status === 'active').length;
  
      updateRecentActivities(users);
      updateRecentBookings(bookings);
    } catch (error) {
      console.error('Dashboard yüklənmə xətası:', error);
    }
  }
  
  function updateRecentActivities(users) {
    const activitiesTable = document.getElementById('recentActivities');
    const recentUsers = users.slice(-5).reverse();
    activitiesTable.innerHTML = recentUsers.map(user => `
      <tr>
        <td class="px-6 py-4">${user.id}</td>
        <td class="px-6 py-4">${user.fullname || user.username}</td>
        <td class="px-6 py-4">Qeydiyyat</td>
        <td class="px-6 py-4">${new Date(user.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }
  
  function updateRecentBookings(bookings) {
    const bookingsTable = document.getElementById('recentBookings');
    const recentBookings = bookings.slice(-5).reverse();
    bookingsTable.innerHTML = recentBookings.map(booking => `
      <tr>
        <td class="px-6 py-4">${booking.id}</td>
        <td class="px-6 py-4">${booking.apartmentName || 'Mənzil'}</td>
        <td class="px-6 py-4">${booking.userName || 'İstifadəçi'}</td>
        <td class="px-6 py-4">${new Date(booking.date).toLocaleDateString()}</td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 text-xs rounded-full ${booking.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
            ${booking.status || 'pending'}
          </span>
        </td>
      </tr>
    `).join('');
  }
  