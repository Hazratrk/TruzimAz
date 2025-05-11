document.addEventListener('DOMContentLoaded', async function() {
   
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentAdmin');
        window.location.href = '../login.html';
    });

lə
    try {
       
        const [usersRes, bookingsRes, reviewsRes] = await Promise.all([
            fetch('http://localhost:8000/users'),
            fetch('http://localhost:8000/bookings'),
            fetch('http://localhost:8000/reviews')
        ]);

        if (!usersRes.ok || !bookingsRes.ok || !reviewsRes.ok) {
            throw new Error('API error');
        }

        const users = await usersRes.json();
        const bookings = await bookingsRes.json();
        const reviews = await reviewsRes.json();

       
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('activeBookings').textContent = bookings.filter(b => b.status === 'active').length;
        document.getElementById('newReviews').textContent = reviews.filter(r => !r.approved).length;
        document.getElementById('totalRevenue').textContent = '$' + bookings
            .reduce((sum, booking) => sum + booking.price, 0)
            .toLocaleString();

        const recentActivities = [
            ...bookings.slice(-3).map(b => ({
                type: 'booking',
                user: users.find(u => u.id === b.userId)?.username || 'Unknown',
                activity: `Rezervasiya: ${b.apartmentName}`,
                date: b.date
            })),
            ...reviews.slice(-2).map(r => ({
                type: 'review',
                user: users.find(u => u.id === r.userId)?.username || 'Unknown',
                activity: `Rəy: ${r.apartmentName}`,
                date: r.date
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        const activitiesTable = document.getElementById('recentActivities');
        recentActivities.forEach(activity => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${activity.type === 'booking' ? 'B#' : 'R#'}${Math.floor(Math.random() * 1000)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${activity.user}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${activity.activity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(activity.date).toLocaleDateString()}</td>
            `;
            activitiesTable.appendChild(row);
        });

    
        const recentBookings = bookings.slice(-5).reverse();
        const bookingsTable = document.getElementById('recentBookings');
        recentBookings.forEach(booking => {
            const statusClass = {
                'active': 'bg-green-100 text-green-800',
                'pending': 'bg-yellow-100 text-yellow-800',
                'cancelled': 'bg-red-100 text-red-800'
            }[booking.status];
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">B#${booking.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.apartmentName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${users.find(u => u.id === booking.userId)?.username || 'Unknown'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(booking.date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${booking.status}
                    </span>
                </td>
            `;
            bookingsTable.appendChild(row);
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        alert('An error occurred while loading dashboard data.');
    }
});

// src/jsfolder/admin.js faylına əlavə edin
document.addEventListener('DOMContentLoaded', function() {
    // Naviqasiya linklərinə hadisə əlavə et
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.getAttribute('href').replace('.html', '');
        loadPage(page);
        history.pushState(null, '', `${page}.html`);
      });
    });
  
    // Səhifə yükləmə funksiyası
    async function loadPage(page) {
      try {
        const response = await fetch(`./${page}.html`);
        const html = await response.text();
        
        // Əsas məzmunu dəyiş
        document.querySelector('main').innerHTML = 
          new DOMParser().parseFromString(html, 'text/html')
            .querySelector('main').innerHTML;
        
        // Aktiv linki güncəllə
        document.querySelectorAll('nav a').forEach(a => {
          a.classList.toggle('bg-gray-700', a.getAttribute('href') === `${page}.html`);
          a.classList.toggle('text-white', a.getAttribute('href') === `${page}.html`);
          a.classList.toggle('text-gray-300', a.getAttribute('href') !== `${page}.html`);
        });
        
        // Başlığı dəyiş
        document.querySelector('header h2').textContent = 
          page.charAt(0).toUpperCase() + page.slice(1);
        
      } catch (err) {
        console.error('Səhifə yüklənərkən xəta:', err);
      }
    }
  
    // Browser geri/irəli düymələri üçün
    window.addEventListener('popstate', () => {
      const page = location.pathname.split('/').pop().replace('.html', '');
      loadPage(page);
    });
  });