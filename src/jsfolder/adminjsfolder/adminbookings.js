document.addEventListener('DOMContentLoaded', async function () {
    const bookingsTable = document.getElementById('bookingsTable');
  
    async function loadBookings() {
      try {
        const [bookingsRes, usersRes, apartmentsRes] = await Promise.all([
          fetch('http://localhost:8000/reservations'),
          fetch('http://localhost:8000/users'),
          fetch('http://localhost:8000/apartments')
        ]);
  
        if (!bookingsRes.ok || !usersRes.ok || !apartmentsRes.ok)
          throw new Error('API fetch error');
  
        const [bookings, users, apartments] = await Promise.all([
          bookingsRes.json(),
          usersRes.json(),
          apartmentsRes.json()
        ]);
  
        bookingsTable.innerHTML = bookings.map(booking => {
          const user = users.find(u => u.id === booking.userId) || {};
          const apartment = apartments.find(a => a.id === booking.apartmentId) || {};
          const statusColor = booking.status === 'active' ? 'text-green-600' :
                              booking.status === 'rejected' ? 'text-red-600' : 'text-gray-500';
  
          return `
            <tr>
              <td class="px-6 py-4 text-sm text-gray-500">${booking.id}</td>
              <td class="px-6 py-4 text-sm">${user.username || 'İstifadəçi yoxdur'}</td>
              <td class="px-6 py-4 text-sm">${apartment.title || 'Mənzil yoxdur'}</td>
              <td class="px-6 py-4 text-sm">${booking.startDate} - ${booking.endDate}</td>
              <td class="px-6 py-4 text-sm">${booking.totalPrice} ₼</td>
              <td class="px-6 py-4 text-sm font-semibold ${statusColor}">${booking.status}</td>
              <td class="px-6 py-4 text-sm">
                <button class="text-red-600 hover:text-red-800 mr-2" onclick="deleteBooking('${booking.id}')">
                  Sil
                </button>
                ${
                  booking.status === 'active'
                    ? `<button class="text-yellow-600 hover:text-yellow-800" onclick="rejectBooking('${booking.id}')">Rədd et</button>`
                    : ''
                }
              </td>
            </tr>
          `;
        }).join('');
      } catch (err) {
        console.error('Rezervasiyalar yüklənərkən xəta:', err);
        bookingsTable.innerHTML = '<tr><td colspan="7" class="text-red-600 p-4">Xəta baş verdi.</td></tr>';
      }
    }
  
    window.deleteBooking = async function (id) {
      if (!confirm('Bu rezervasiyanı silmək istədiyinizə əminsiniz?')) return;
  
      try {
        const res = await fetch(`http://localhost:8000/reservations/${id}`, {
          method: 'DELETE'
        });
  
        if (!res.ok) throw new Error('Delete failed');
  
        await loadBookings();
        alert('Rezervasiya silindi.');
      } catch (err) {
        console.error('Silinərkən xəta:', err);
        alert('Rezervasiya silinərkən xəta baş verdi');
      }
    };
  
    window.rejectBooking = async function (id) {
      try {
        const res = await fetch(`http://localhost:8000/reservations/${id}`);
        if (!res.ok) throw new Error('Booking not found');
  
        const booking = await res.json();
        booking.status = 'rejected';
  
        const updateRes = await fetch(`http://localhost:8000/reservations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        });
  
        if (!updateRes.ok) throw new Error('Reject failed');
  
        await loadBookings();
        alert('Rezervasiya rədd edildi.');
      } catch (err) {
        console.error('Rədd edilərkən xəta:', err);
        alert('Rədd edilərkən xəta baş verdi');
      }
    };
  
    await loadBookings();
  });
  