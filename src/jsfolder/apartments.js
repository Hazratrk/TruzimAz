const API_URL = "http://localhost:8000/apartments";


async function fetchApartments() {
  try {
    const res = await fetch(API_URL);
    const apartments = await res.json();
    renderApartmentList(apartments);
  } catch (error) {
    console.error("Error fetching apartments:", error);
  }
}


function renderApartmentList(apartments) {
  const apartmentList = document.getElementById("apartment-list");
  
  apartmentList.innerHTML = apartments.map(apt => `
    <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5">
  <img src="${apt.image}" alt="${apt.title}" class="w-full h-52 object-cover rounded-xl mb-5">
  <h2 class="text-2xl font-bold text-gray-800 mb-1">${apt.title}</h2>
  <p class="text-gray-500 text-sm mb-2">${apt.location}</p>
  <p class="text-blue-700 font-bold text-lg">₼${apt.nightPrice} / gecə</p>
  <a href="detail.html?id=${apt.id}" class="block mt-5 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition-colors duration-300">
    Daha çox
  </a>
</div>

  `).join("");
}

fetchApartments();