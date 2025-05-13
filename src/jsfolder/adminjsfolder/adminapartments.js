let currentEditingId = null;

// DOM Elements
const apartmentsTable = document.getElementById('apartmentsTable');
const addApartmentBtn = document.getElementById('addApartmentBtn');
const apartmentForm = document.getElementById('apartmentForm');
const apartmentModal = document.getElementById('apartmentModal');
const modalTitle = document.getElementById('modalTitle');


const formFields = {
  id: document.getElementById('apartmentId'),
  title: document.getElementById('title'),
  location: document.getElementById('location'),
  nightPrice: document.getElementById('nightPrice'),
  image: document.getElementById('image'),
  features: document.getElementById('features'),
  description: document.getElementById('description'),
  rules: document.getElementById('rules'),
  messages: document.getElementById('messages')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  addApartmentBtn.addEventListener('click', openAddApartmentModal);
  apartmentForm.addEventListener('submit', saveApartment);
  loadApartments();
});

// Load apartments from API
async function loadApartments() {
  try {
    const response = await fetch('http://localhost:8000/apartments');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const apartments = await response.json();
    renderApartmentsTable(apartments);
  } catch (error) {
    console.error('Error loading apartments:', error);
    alert('Mənzillər yüklənərkən xəta baş verdi');
  }
}

// Render apartments table
function renderApartmentsTable(apartments) {
  apartmentsTable.innerHTML = apartments.map(apartment => `
    <tr class="hover:bg-gray-50 transition">
      <td class="px-6 py-4">
        <img src="${apartment.image}" class="w-16 h-16 object-cover rounded" alt="${apartment.title}">
      </td>
      <td class="px-6 py-4 font-medium">${apartment.title}</td>
      <td class="px-6 py-4">${apartment.location}</td>
      <td class="px-6 py-4 font-semibold">${apartment.nightPrice} ₼</td>
      <td class="px-6 py-4">
        <button onclick="editApartment('${apartment.id}')" 
                class="text-blue-600 hover:text-blue-800 mr-3 px-3 py-1 rounded hover:bg-blue-50 transition">
          <i class="fas fa-edit mr-1"></i>Düzəlt
        </button>
        <button onclick="deleteApartment('${apartment.id}')" 
                class="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition">
          <i class="fas fa-trash mr-1"></i>Sil
        </button>
      </td>
    </tr>
  `).join('');
}

// Open modal for adding new apartment
function openAddApartmentModal() {
  currentEditingId = null;
  modalTitle.textContent = 'Yeni Mənzil Əlavə Et';
  resetForm();
  apartmentModal.classList.remove('hidden');
  apartmentModal.classList.add('flex');
}

// Edit apartment
async function editApartment(id) {
  try {
    const response = await fetch(`http://localhost:8000/apartments/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const apartment = await response.json();
    
    currentEditingId = id;
    modalTitle.textContent = 'Mənzili Düzəlt';
    
    // Fill form fields
    formFields.id.value = id;
    formFields.title.value = apartment.title;
    formFields.location.value = apartment.location;
    formFields.nightPrice.value = apartment.nightPrice;
    formFields.image.value = apartment.image;
    formFields.features.value = apartment.features?.join(', ') || '';
    formFields.description.value = apartment.description;
    formFields.rules.value = apartment.rules || '';
    formFields.messages.value = apartment.messages || '';
    
    apartmentModal.classList.remove('hidden');
    apartmentModal.classList.add('flex');
  } catch (error) {
    console.error('Error editing apartment:', error);
    alert('Mənzil məlumatları yüklənərkən xəta baş verdi');
  }
}

// Save apartment (create or update)
async function saveApartment(event) {
  event.preventDefault();
  
  const apartmentData = {
    title: formFields.title.value.trim(),
    location: formFields.location.value.trim(),
    nightPrice: parseFloat(formFields.nightPrice.value),
    image: formFields.image.value.trim(),
    features: formFields.features.value.split(',').map(item => item.trim()).filter(item => item),
    description: formFields.description.value.trim(),
    rules: formFields.rules.value.trim(),
    messages: formFields.messages.value.trim()
  };

  // Validate required fields
  if (!apartmentData.title || !apartmentData.location || !apartmentData.nightPrice || !apartmentData.image) {
    alert('Zəhmət olmasa bütün tələb olunan sahələri doldurun!');
    return;
  }

  try {
    const url = currentEditingId 
      ? `http://localhost:8000/apartments/${currentEditingId}`
      : 'http://localhost:8000/apartments';
      
    const method = currentEditingId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apartmentData)
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const result = await response.json();
    console.log('API Response:', result);
    
    closeModal();
    loadApartments();
    
    alert(`Mənzil ${currentEditingId ? 'yeniləndi' : 'əlavə edildi'}!`);
  } catch (error) {
    console.error('Error saving apartment:', error);
    alert('Mənzil yadda saxlanarkən xəta baş verdi: ' + error.message);
  }
}

// Delete apartment
async function deleteApartment(id) {
  if (!confirm('Bu mənzili silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz!')) return;
  
  try {
    const response = await fetch(`http://localhost:8000/apartments/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    loadApartments();
    alert('Mənzil uğurla silindi!');
  } catch (error) {
    console.error('Error deleting apartment:', error);
    alert('Mənzil silinərkən xəta baş verdi: ' + error.message);
  }
}

// Reset form
function resetForm() {
  apartmentForm.reset();
  formFields.id.value = '';
}

// Close modal
function closeModal() {
  apartmentModal.classList.add('hidden');
  apartmentModal.classList.remove('flex');
  resetForm();
}

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target === apartmentModal) {
    closeModal();
  }
};
