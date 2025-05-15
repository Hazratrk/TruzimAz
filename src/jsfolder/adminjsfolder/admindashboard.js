document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();

  const form = document.getElementById('addApartmentForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await addNewApartment();
    });
  }
});

let dashboardData = {
  users: [],
  apartments: [],
  bookings: [],
  reviews: []
};

async function loadDashboardData() {
  try {
    showLoading(true);

    const endpoints = ['users', 'apartments', 'bookings', 'reviews'];
    
    // Her endpoint ucun ayri-ayri sorgu gonderilib xeta olsa, digerleri isleyeceik
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:8000/${endpoint}`);
        if (!response.ok) {
          console.warn(`${endpoint} verilənləri yüklənərkən problem: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        if (Array.isArray(data)) {
          dashboardData[endpoint] = data;
        } else {
          console.warn(`${endpoint} üçün düzgün məlumat formatı deyil`);
          dashboardData[endpoint] = [];
        }
      } catch (endpointError) {
        console.error(`${endpoint} verilənləri yüklənərkən xəta:`, endpointError);
        // Xeta bas vererse, bos array istifade edek
        dashboardData[endpoint] = [];
      }
    }

    // Məlumatları yükləmək üçün funksiyaları təhlükəsiz çağır
    try { updateDashboardStats(); } catch (e) { console.error('Statistika yenilənərkən xəta:', e); }
    try { renderApartmentsList(); } catch (e) { console.error('Mənzil siyahısı göstərilərkən xəta:', e); }
    try { renderRecentBookings(); } catch (e) { console.error('Son rezervasiyalar göstərilərkən xəta:', e); }
    try { renderRecentUsers(); } catch (e) { console.error('Son istifadəçilər göstərilərkən xəta:', e); }
    
  } catch (error) {
    console.error('Dashboard yüklənərkən xəta:', error);
    showAlert('error', 'Məlumatlar yüklənərkən xəta baş verdi. Səhifəni yeniləyin və ya daha sonra cəhd edin.');
  } finally {
    showLoading(false);
  }
}

function updateDashboardStats() {
  // DOM elementlerinin varlığını yoxla və təhlükəsiz dəyərlər təyin et
  const totalUsersEl = document.getElementById('totalUsers');
  if (totalUsersEl) totalUsersEl.textContent = dashboardData.users.length;
  
  const activeUsersEl = document.getElementById('activeUsers');
  if (activeUsersEl) {
    const activeCount = dashboardData.users.filter(u => u && u.isActive).length;
    activeUsersEl.textContent = activeCount;
  }
  
  const totalApartmentsEl = document.getElementById('totalApartments');
  if (totalApartmentsEl) totalApartmentsEl.textContent = dashboardData.apartments.length;
  
  const activeBookingsEl = document.getElementById('activeBookings');
  if (activeBookingsEl) {
    const activeCount = dashboardData.bookings.filter(b => b && b.status === 'active').length;
    activeBookingsEl.textContent = activeCount;
  }
  
  const totalRevenueEl = document.getElementById('totalRevenue');
  if (totalRevenueEl) {
    const totalRevenue = dashboardData.bookings.reduce((sum, b) => {
      return sum + (b && !isNaN(parseFloat(b.totalPrice)) ? parseFloat(b.totalPrice) : 0)
    }, 0);
    totalRevenueEl.textContent = totalRevenue.toFixed(2) + ' ₼';
  }
}

function renderApartmentsList() {
  const container = document.getElementById('apartmentsContainer');
  if (!container) return;

  if (!dashboardData.apartments || dashboardData.apartments.length === 0) {
    container.innerHTML = '<div class="text-center p-5 text-gray-500">Mənzil tapılmadı</div>';
    return;
  }

  container.innerHTML = dashboardData.apartments.map(apartment => {
    // Mümkün undefined/null dəyərlər üçün yoxlama
    const id = apartment?.id || '';
    const title = apartment?.title || 'Başlıq yoxdur';
    const location = apartment?.location || 'Məkan göstərilməyib';
    const nightPrice = apartment?.nightPrice || 0;
    const image = apartment?.image || 'https://via.placeholder.com/400x200?text=Şəkil+yoxdur';

    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <img src="${image}" alt="${title}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x200?text=Şəkil+yüklənmədi'">
        <div class="p-4">
          <h3 class="font-bold text-lg mb-1">${title}</h3>
          <p class="text-gray-600 text-sm mb-2">
            <i class="fas fa-map-marker-alt text-teal-500 mr-1"></i>${location}
          </p>
          <p class="text-teal-600 font-bold mb-3">${nightPrice} ₼ / gecə</p>
          <div class="flex justify-between">
            <button onclick="editApartment('${id}')" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-edit mr-1"></i>Düzəlt
            </button>
            <button onclick="deleteApartment('${id}')" class="text-red-600 hover:text-red-800">
              <i class="fas fa-trash mr-1"></i>Sil
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentBookings() {
  const container = document.getElementById('recentBookings');
  if (!container) return;

  if (!dashboardData.bookings || dashboardData.bookings.length === 0) {
    container.innerHTML = '<div class="text-center p-5 text-gray-500">Rezervasiya tapılmadı</div>';
    return;
  }

  const recentBookings = dashboardData.bookings.slice(0, 5);

  container.innerHTML = recentBookings.map(booking => {
    // Null check ilə təhlükəsiz əməliyyatlar
    const userId = booking?.userId;
    const apartmentId = booking?.apartmentId;
    
    const user = userId ? (dashboardData.users.find(u => u && u.id === userId) || {}) : {};
    const apartment = apartmentId ? (dashboardData.apartments.find(a => a && a.id === apartmentId) || {}) : {};

    const userName = user?.name || 'İstifadəçi';
    const userAvatar = user?.avatar || 'https://via.placeholder.com/40?text=İstifadəçi';
    const apartmentTitle = apartment?.title || 'Mənzil';
    const bookingTotal = booking?.totalPrice || 0;
    const bookingStatus = booking?.status || 'unknown';

    return `
      <div class="flex items-center p-3 hover:bg-gray-50">
        <div class="flex-shrink-0">
          <img src="${userAvatar}" class="w-10 h-10 rounded-full" alt="${userName}" onerror="this.src='https://via.placeholder.com/40?text=İstifadəçi'">
        </div>
        <div class="ml-4 flex-1">
          <p class="font-medium">${userName}</p>
          <p class="text-sm text-gray-500">${apartmentTitle}</p>
        </div>
        <div class="text-right">
          <p class="font-medium">${bookingTotal} ₼</p>
          <p class="text-sm ${bookingStatus === 'active' ? 'text-green-600' : 'text-gray-500'}">
            ${bookingStatus === 'active' ? 'Aktiv' : 'Tamamlanıb'}
          </p>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentUsers() {
  const container = document.getElementById('recentUsers');
  if (!container) return;

  if (!dashboardData.users || dashboardData.users.length === 0) {
    container.innerHTML = '<div class="text-center p-5 text-gray-500">İstifadəçi tapılmadı</div>';
    return;
  }

  const recentUsers = dashboardData.users.slice(0, 5);

  container.innerHTML = recentUsers.map(user => {
    // Null check ilə təhlükəsiz əməliyyatlar
    const name = user?.name || 'Ad göstərilməyib';
    const email = user?.email || 'E-poçt göstərilməyib';
    const avatar = user?.avatar || 'https://via.placeholder.com/40?text=İstifadəçi';
    const isActive = user?.isActive ?? false;

    return `
      <div class="flex items-center p-3 hover:bg-gray-50">
        <div class="flex-shrink-0">
          <img src="${avatar}" class="w-10 h-10 rounded-full" alt="${name}" onerror="this.src='https://via.placeholder.com/40?text=İstifadəçi'">
        </div>
        <div class="ml-4 flex-1">
          <p class="font-medium">${name}</p>
          <p class="text-sm text-gray-500">${email}</p>
        </div>
        <span class="px-2 py-1 text-xs rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
          ${isActive ? 'Aktiv' : 'Qeyri-aktiv'}
        </span>
      </div>
    `;
  }).join('');
}

async function addNewApartment() {
  const form = document.getElementById('addApartmentForm');
  if (!form) return;

  try {
    // Form sahelerinin yoxlanmasi
    const title = form.apartmentTitle?.value?.trim();
    const location = form.apartmentLocation?.value?.trim();
    const priceValue = form.apartmentPrice?.value;
    const nightPrice = priceValue ? parseFloat(priceValue) : 0;
    const image = form.apartmentImage?.value?.trim() || 'https://via.placeholder.com/400x200?text=Şəkil+yoxdur';
    const description = form.apartmentDescription?.value?.trim() || '';

    if (!title) {
      showAlert('error', 'Mənzil başlığı mütləq daxil edilməlidir');
      return;
    }

    if (!location) {
      showAlert('error', 'Məkan mütləq daxil edilməlidir');
      return;
    }

    if (isNaN(nightPrice) || nightPrice <= 0) {
      showAlert('error', 'Düzgün qiymət daxil edin');
      return;
    }

    const apartmentData = {
      title,
      location,
      nightPrice,
      image,
      description,
      features: [],
      rules: '',
      status: 'active'
    };

    showLoading(true);
    const response = await fetch('http://localhost:8000/apartments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apartmentData)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Bilinməyən xəta');
      throw new Error(`Mənzil əlavə edilə bilmədi: ${response.status} - ${errorText}`);
    }

    const newApartment = await response.json();
    dashboardData.apartments.push(newApartment);

    updateDashboardStats();
    renderApartmentsList();
    form.reset();

    showAlert('success', 'Mənzil uğurla əlavə edildi!');
  } catch (error) {
    console.error('Mənzil əlavə edilərkən xəta:', error);
    showAlert('error', 'Mənzil əlavə edilərkən xəta baş verdi: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function editApartment(id) {
  if (!id) {
    console.error('Düzəliş üçün ID verilməyib');
    showAlert('error', 'Düzəliş üçün mənzil ID-si tapılmadı');
    return;
  }
  
  try {
    // Mənzilin məlumatlarını əldə et
    const apartment = dashboardData.apartments.find(a => a && a.id === id);
    
    if (!apartment) {
      showAlert('error', 'Düzəliş üçün mənzil tapılmadı');
      return;
    }
    
    console.log('Editing apartment:', id);
    // TODO: Burada düzəliş modal və ya formu göstərilməlidir
    showAlert('info', 'Düzəliş funksiyası hazırlanır...');
  } catch (error) {
    console.error('Mənzil düzəliş xətası:', error);
    showAlert('error', 'Mənzil düzəlişi zamanı xəta baş verdi');
  }
}

async function deleteApartment(id) {
  if (!id) {
    console.error('Silinmə üçün ID verilməyib');
    showAlert('error', 'Silinəcək mənzil ID-si tapılmadı');
    return;
  }

  if (!confirm('Bu mənzili silmək istədiyinizə əminsiniz?')) return;

  try {
    showLoading(true);
    const res = await fetch(`http://localhost:8000/apartments/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Bilinməyən xəta');
      throw new Error(`Silinmə xətası: ${res.status} - ${errorText}`);
    }

    dashboardData.apartments = dashboardData.apartments.filter(a => a && a.id !== id);
    updateDashboardStats();
    renderApartmentsList();

    showAlert('success', 'Mənzil uğurla silindi!');
  } catch (error) {
    console.error('Mənzil silinərkən xəta:', error);
    showAlert('error', 'Mənzil silinərkən xəta baş verdi: ' + error.message);
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = show ? 'block' : 'none';
}

function showAlert(type, message) {
  // Tip dəyəri yoxla və standartlaşdır
  const validTypes = ['success', 'error', 'info', 'warning'];
  const alertType = validTypes.includes(type) ? type : 'info';
  
  // Rəng sinifləri
  const colorClasses = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800'
  };
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-md z-50 ${colorClasses[alertType]}`;
  alertDiv.textContent = message || 'Bildiriş';
  document.body.appendChild(alertDiv);

  // 3 saniyədən sonra bildirişi sil
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    alertDiv.style.transition = 'opacity 0.5s ease';
    setTimeout(() => alertDiv.remove(), 500);
  }, 3000);
}

// Qlobal funksiyalar
window.editApartment = editApartment;
window.deleteApartment = deleteApartment;