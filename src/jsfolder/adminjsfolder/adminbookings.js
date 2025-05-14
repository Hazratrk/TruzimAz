
    document.addEventListener('DOMContentLoaded', function() {
      // DOM 
      const bookingsBody = document.getElementById('bookings-body');
      const addBookingBtn = document.getElementById('add-booking-btn');
      const bookingModal = document.getElementById('booking-modal');
      const editModal = document.getElementById('edit-modal');
      const closeModals = document.querySelectorAll('.modal-close');
      const bookingForm = document.getElementById('booking-form');
      const editForm = document.getElementById('edit-form');
      const searchInput = document.getElementById('search-bookings');
      const filterStatus = document.getElementById('filter-status');
      
     
      let bookings = [];
      let apartments = [];
      let users = [];
      
    
      loadData();
      
     
      addBookingBtn.addEventListener('click', () => bookingModal.classList.add('active'));
      closeModals.forEach(btn => {
          btn.addEventListener('click', () => {
              bookingModal.classList.remove('active');
              editModal.classList.remove('active');
          });
      });
      
       
      searchInput.addEventListener('input', filterBookings);
      filterStatus.addEventListener('change', filterBookings);
      
      
      async function loadData() {
          try {
              const response = await fetch('db.json');
              const data = await response.json();
              
              bookings = data.reservations.map(res => ({
                  id: res.id,
                  apartmentId: res.apartmentId,
                  apartmentTitle: getApartmentTitle(res.apartmentId, data.apartments),
                  userName: res.name || getUserName(res.userId, data.users),
                  startDate: res.startDate,
                  endDate: res.endDate,
                  totalPrice: res.totalPrice || calculatePrice(res.startDate, res.endDate, res.apartmentId, data.apartments),
                  status: res.status || 'pending',
                  createdAt: res.createdAt || new Date().toISOString()
              }));
              
              apartments = data.apartments;
              users = data.users;
              
              renderBookings(bookings);
              populateApartmentSelect();
              populateUserSelect();
          } catch (error) {
              console.error('Error loading data:', error);
          }
      }
      
      // Rezervasiyalar
      function renderBookings(bookingsToRender) {
          bookingsBody.innerHTML = '';
          
          bookingsToRender.forEach(booking => {
              const row = document.createElement('tr');
              
              row.innerHTML = `
                  <td>${booking.id}</td>
                  <td>${booking.apartmentTitle || 'N/A'}</td>
                  <td>${booking.userName || 'N/A'}</td>
                  <td>${formatDate(booking.startDate)}</td>
                  <td>${formatDate(booking.endDate)}</td>
                  <td>${booking.totalPrice} AZN</td>
                  <td>
                      <span class="status-badge status-${booking.status}">${booking.status}</span>
                  </td>
                  <td>${formatDate(booking.createdAt)}</td>
                  <td>
                      <button class="btn btn-primary btn-sm btn-edit" data-id="${booking.id}">
                          <i class="fas fa-edit mr-1"></i> Edit
                      </button>
                      <button class="btn btn-danger btn-sm btn-delete" data-id="${booking.id}">
                          <i class="fas fa-trash mr-1"></i> Delete
                      </button>
                      ${booking.status !== 'confirmed' ? 
                          `<button class="btn btn-success btn-sm btn-confirm" data-id="${booking.id}">
                              <i class="fas fa-check mr-1"></i> Confirm
                          </button>` : ''}
                  </td>
              `;
              
              bookingsBody.appendChild(row);
          });
          
          // Button
          document.querySelectorAll('.btn-edit').forEach(btn => {
              btn.addEventListener('click', handleEdit);
          });
          
          document.querySelectorAll('.btn-delete').forEach(btn => {
              btn.addEventListener('click', handleDelete);
          });
          
          document.querySelectorAll('.btn-confirm').forEach(btn => {
              btn.addEventListener('click', handleConfirm);
          });
      }
      
      // Rezervasiya
      bookingForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(bookingForm);
          const apartmentId = formData.get('apartment');
          const userId = formData.get('user');
          const startDate = formData.get('start-date');
          const endDate = formData.get('end-date');
          
          const newBooking = {
              id: generateId(),
              apartmentId,
              userId,
              startDate,
              endDate,
              totalPrice: calculatePrice(startDate, endDate, apartmentId, apartments),
              status: 'confirmed',
              createdAt: new Date().toISOString()
          };
          
      
          bookings.push(newBooking);
          renderBookings(bookings);
          
         
          try {
              await saveBookingToDB(newBooking);
          } catch (error) {
              console.error('Error saving booking:', error);
          }
          
       
          bookingForm.reset();
          bookingModal.classList.remove('active');
      });

      function handleEdit(e) {
          const bookingId = e.target.dataset.id;
          const booking = bookings.find(b => b.id === bookingId);
          
          if (booking) {
              document.getElementById('edit-apartment').value = booking.apartmentId;
              document.getElementById('edit-user').value = booking.userId;
              document.getElementById('edit-start-date').value = booking.startDate;
              document.getElementById('edit-end-date').value = booking.endDate;
              document.getElementById('edit-status').value = booking.status;
              document.getElementById('edit-id').value = booking.id;
              
              editModal.classList.add('active');
          }
      }

      function handleDelete(e) {
          if (confirm('Are you sure you want to delete this booking?')) {
              const bookingId = e.target.dataset.id;
              bookings = bookings.filter(b => b.id !== bookingId);
              renderBookings(bookings);
              
              // DB.json-dan silmək üçün (əgər backend varsa)
              deleteBookingFromDB(bookingId);
          }
      }
      

      function handleConfirm(e) {
          const bookingId = e.target.dataset.id;
          const bookingIndex = bookings.findIndex(b => b.id === bookingId);
          
          if (bookingIndex !== -1) {
              bookings[bookingIndex].status = 'confirmed';
              renderBookings(bookings);
              
              // DB.json-da yeniləmək üçün (əgər backend varsa)
              updateBookingStatus(bookingId, 'confirmed');
          }
      }
      

      function filterBookings() {
          const searchTerm = searchInput.value.toLowerCase();
          const statusFilter = filterStatus.value;
          
          let filtered = bookings;
          
          if (searchTerm) {
              filtered = filtered.filter(b => 
                  (b.apartmentTitle && b.apartmentTitle.toLowerCase().includes(searchTerm)) || 
                  (b.userName && b.userName.toLowerCase().includes(searchTerm)) ||
                  (b.id && b.id.toLowerCase().includes(searchTerm))
              );
          }
          
          if (statusFilter !== 'all') {
              filtered = filtered.filter(b => b.status === statusFilter);
          }
          
          renderBookings(filtered);
      }
      

      function getApartmentTitle(apartmentId, apartments) {
          const apartment = apartments.find(a => a.id == apartmentId);
          return apartment ? apartment.title : 'N/A';
      }
      
      function getUserName(userId, users) {
          const user = users.find(u => u.id == userId);
          return user ? user.fullname || user.username : 'N/A';
      }
      
      function calculatePrice(startDate, endDate, apartmentId, apartments) {
          const apartment = apartments.find(a => a.id == apartmentId);
          if (!apartment) return 0;
          
          const start = new Date(startDate);
          const end = new Date(endDate);
          const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          
          return nights * apartment.nightPrice;
      }
      
      function formatDate(dateString) {
          if (!dateString) return 'N/A';
          const date = new Date(dateString);
          return date.toLocaleDateString();
      }
      
      function generateId() {
          return Math.random().toString(36).substr(2, 9);
      }
      
      function populateApartmentSelect() {
          const select = document.getElementById('apartment');
          const editSelect = document.getElementById('edit-apartment');
          
          select.innerHTML = '<option value="">Select Apartment</option>';
          editSelect.innerHTML = '<option value="">Select Apartment</option>';
          
          apartments.forEach(apartment => {
              const option = document.createElement('option');
              option.value = apartment.id;
              option.textContent = `${apartment.title} (${apartment.location}) - ${apartment.nightPrice} AZN/night`;
              select.appendChild(option.cloneNode(true));
              editSelect.appendChild(option);
          });
      }
      
      function populateUserSelect() {
          const select = document.getElementById('user');
          const editSelect = document.getElementById('edit-user');
          
          select.innerHTML = '<option value="">Select User</option>';
          editSelect.innerHTML = '<option value="">Select User</option>';
          
          users.forEach(user => {
              const option = document.createElement('option');
              option.value = user.id;
              option.textContent = user.fullname || user.username || user.email;
              select.appendChild(option.cloneNode(true));
              editSelect.appendChild(option);
          });
      }
      
  
      async function saveBookingToDB(booking) {

          console.log('Booking saved to DB:', booking);
      }
      
      async function deleteBookingFromDB(bookingId) {

          console.log('Booking deleted from DB:', bookingId);
      }
      
      async function updateBookingStatus(bookingId, status) {
         
          console.log('Booking status updated:', bookingId, status);
      }
  });
