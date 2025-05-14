const API_URL = "http://localhost:8000/apartments";


let currentApartments = []; 

async function fetchApartments() {
  try {
    const res = await fetch(API_URL);
    const apartments = await res.json();
    currentApartments = apartments; 
    renderApartmentList(currentApartments); 
  } catch (error) {
    console.error("Error fetching apartments:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const apartmentList = document.getElementById('apartment-list');
  const searchInput = document.getElementById('location-search');

  let apartments = [];

  // Veriləri yüklə
  fetch('db.json')
    .then(res => res.json())
    .then(data => {
      apartments = data.apartments;
      displayApartments(apartments);
    });

  // Filtr funksiyası
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const filtered = apartments.filter(apt =>
      apt.location.toLowerCase().includes(searchTerm)
    );
    displayApartments(filtered);
  });

  function displayApartments(list) {
    apartmentList.innerHTML = '';

    if (list.length === 0) {
      apartmentList.innerHTML = '<p class="text-gray-600 col-span-full">Heç bir nəticə tapılmadı.</p>';
      return;
    }

    list.forEach(apartment => {
      apartmentList.innerHTML += `
        <div class="bg-white rounded-lg shadow-md overflow-hidden ">
          <img src="${apartment.image}" alt="${apartment.title}" class="w-full h-56 object-cover">
          <div class="p-4">
            <h3 class="text-xl text-blue-700 font-bold">${apartment.title}</h3>
            <p class="text-blue-700">${apartment.location}</p>
            <p class="text-blue-600 font-semibold mt-2">₼${apartment.nightPrice} / night</p>
            <a href="detail.html?id=${apartment.id}" class="inline-block mt-4 bg-blue-600 text-white px-4 py-2 text-blue-700  rounded hover:bg-blue-700">
              Detail
            </a>
          </div>
        </div>
      `;
    });
  }
});
function renderApartmentList(apartments) {
  const apartmentList = document.getElementById("apartment-list");

  apartmentList.innerHTML = apartments.map(apt => `
    <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 apartment-card">
      <img src="${apt.image}" alt="${apt.title}" class="w-full h-52 object-cover rounded-xl mb-5">
      <h2 class="text-2xl font-bold text-gray-800 mb-1">${apt.title}</h2>
      <p class="text-gray-500 text-sm mb-2">${apt.location}</p>
      <p class="text-blue-700 font-bold text-lg">₼${apt.nightPrice} / gecə</p>
      <a href="detail.html?id=${apt.id}" class="block mt-5 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition-colors duration-300">
        Detail
      </a>
    </div>
  `).join("");
}



document.getElementById("sort-low-high").addEventListener("click", () => {
  const sorted = [...currentApartments].sort((a, b) => a.nightPrice - b.nightPrice);
  renderApartmentList(sorted);
});

document.getElementById("sort-high-low").addEventListener("click", () => {
  const sorted = [...currentApartments].sort((a, b) => b.nightPrice - a.nightPrice);
  renderApartmentList(sorted);
});

fetchApartments();

