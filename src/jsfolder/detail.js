document.addEventListener('DOMContentLoaded', function () {
 
    const urlParams = new URLSearchParams(window.location.search);
    const apartmentId = urlParams.get('id');
  
    if (!apartmentId) {
      window.location.href = 'apartments.html';
      return;
    }
  
    
    fetch('db.json')
      .then(response => response.json())
      .then(data => {
        const apartment = data.apartments.find(apt => apt.id === apartmentId);
  
        if (!apartment) {
          window.location.href = 'apartments.html';
                  return;
        }
  
        renderApartmentDetails(apartment);
      })
      .catch(error => {
        console.error('Error fetching apartment data:', error);
        window.location.href = 'apartments.html';
      });
  });
  
  function renderApartmentDetails(apartment) {
    const container = document.getElementById('apartment-detail');
    const formattedPrice = `₼${apartment.nightPrice} / night`;
  
    const featuresList = apartment.features.map(feature =>
      `<li class="flex items-center space-x-2">
        <i class="fas fa-check text-green-500"></i>
        <span class="text-gray-800">${feature}</span>
      </li>`
    ).join('');
  
    container.innerHTML = `
      <div class="image-gallery p-4">
        <div class="main-image rounded-lg overflow-hidden">
          <img src="${apartment.image}" alt="${apartment.title}" class="w-full h-96 object-cover rounded-lg">
        </div>
            </div>
  
      <div class="p-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">${apartment.title}</h1>
            <p class="text-gray-600 mt-2">
              <i class="fas fa-map-marker-alt text-blue-600"></i> ${apartment.location}
            </p>
          </div>
          <div class="text-2xl font-bold text-blue-700">${formattedPrice}</div>
        </div>
  
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-3 border-b pb-1 border-gray-300">Description</h2>
          <p class="text-gray-700 leading-relaxed">${apartment.description}</p>
        </div>
  
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-3 border-b pb-1 border-gray-300">Features</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
            ${featuresList}
          </ul>
        </div>
         <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-3 border-b pb-1 border-gray-300">House Rules</h2>
          <p class="text-gray-700 leading-relaxed">${apartment.rules}</p>
        </div>
  
        <div class="mt-10 flex justify-center">
          <button id="reservation-btn" class="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-10 rounded-lg transition duration-300 shadow-md">
            Reservation
          </button>
        </div>
      </div>
    `;
  
   
    const reservationBtn = document.getElementById("reservation-btn");
    reservationBtn.addEventListener("click", function () {
      window.location.href = `reservation.html?id=${apartment.id}`;
    });
  }

