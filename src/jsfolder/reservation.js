document.addEventListener("DOMContentLoaded", () => {
  // 1. URL
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get("id");
  
  // 2. ID
  if (!apartmentId) {
    alert("Xəta: Apartament ID-si tapılmadı! Keçərli URL nümunəsi: apartment.html?id=1");
    window.location.href = "apartments.html";
    return;
  }

  // 3. Apartament 
  fetch(`http://localhost:8000/apartments/${apartmentId}`)
    .then(res => {
      if (!res.ok) throw new Error("Apartament tapılmadı");
      return res.json();
    })
    .then(apartment => {
      
      renderReservationPage(apartment);
      
    
      document.getElementById("startDate").addEventListener("change", () => calculatePrice(apartment));
      document.getElementById("endDate").addEventListener("change", () => calculatePrice(apartment));
    })
    .catch(err => {
      console.error("Xəta:", err);
      alert(`Xəta: ${err.message}`);
      window.location.href = "apartments.html";
    });
});


function calculatePrice(apartment) {
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);
  
  if (startDate && endDate && startDate < endDate) {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = days * apartment.nightPrice;
    
   
    const priceDisplay = document.getElementById("price-display") || document.createElement("div");
    priceDisplay.id = "price-display";
    priceDisplay.innerHTML = `
      <div class="bg-blue-50 p-3 mt-4 rounded-lg">
        <p class="font-bold">Ümumi qiymət: <span class="text-blue-700">${totalPrice} AZN</span></p>
        <p class="text-sm">(${days} gün x ${apartment.nightPrice} AZN)</p>
      </div>
    `;
    
    const form = document.getElementById("reservation-form");
    form.appendChild(priceDisplay);
  }
}

//  render 
function renderReservationPage(apartment) {
  const container = document.getElementById("reservation-container");
  
  container.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mt-10">
      <h2 class="text-2xl font-bold mb-4 text-blue-700">${apartment.title}</h2>
      <p class="mb-2 text-gray-700">
        <i class="fas fa-map-marker-alt text-blue-600"></i> ${apartment.location}
      </p>
      <img src="${apartment.image}" class="w-full h-64 object-cover rounded mb-4" alt="${apartment.title}" />
      <p class="mb-4 text-gray-600">${apartment.description}</p>
      <p class="mb-4 text-blue-400 font-bold">Price for 1 night: ${apartment.nightPrice} AZN</p>

      <form id="reservation-form" class="space-y-4">
        <input type="text" id="name" placeholder="Name" class="w-full text-blue-600 border p-2 rounded" required />
        <input type="date" id="startDate" class="w-full border text-blue-600 p-2 rounded" required />
        <input type="date" id="endDate" class="w-full border p-2 text-blue-600 rounded" required />
        <button type="submit" class="bg-blue-700 hover:bg-blue-800  text-blue-600 text-white px-6 py-2 rounded">
          Reservation
        </button>
      </form>

      <div id="success-message" class="hidden mt-4 p-3 bg-green-100 text-green-800 rounded"></div>
    </div>
  `;


  document.getElementById("reservation-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    
    if (!name || !startDate || !endDate) {
      alert("Zəhmət olmasa bütün sahələri doldurun!");
      return;
    }

 
    const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const totalPrice = days * apartment.nightPrice;


    fetch("http://localhost:8000/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        startDate,
        endDate,
        apartmentId: apartment.id,
        totalPrice
      })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById("success-message").innerHTML = `
          ✅ Rezervasiya uğurla tamamlandı!<br>
          Ümumi qiymət: <strong>${totalPrice} AZN</strong>
        `;
        document.getElementById("success-message").classList.remove("hidden");
      })
      .catch(err => {
        console.error("Xəta:", err);
        alert("Rezervasiya zamanı xəta baş verdi");
      });
  });
}