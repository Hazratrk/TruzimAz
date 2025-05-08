document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const apartmentId = urlParams.get("id");
  
    if (!apartmentId) {
      alert("Apartment ID tapılmadı.");
      window.location.href = "apartments.html";
      return;
    }
  
    // Apartment məlumatını al
    fetch("http://localhost:8000/apartments")
      .then(res => res.json())
      .then(data => {
        const apartment = data.find(item => item.id == apartmentId);
        if (!apartment) {
          alert("Apartment tapılmadı.");
          window.location.href = "apartments.html";
          return;
        }
  
        renderReservationPage(apartment);
      })
      .catch(err => {
        console.error("Apartment data alınmadı:", err);
      });
  });
  
  function renderReservationPage(apartment) {
    const container = document.getElementById("reservation-container");
  
    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mt-10">
        <h2 class="text-2xl font-bold mb-4 text-blue-700">${apartment.title}</h2>
        <p class="mb-2 text-gray-700"><i class="fas fa-map-marker-alt text-blue-600"></i> ${apartment.location}</p>
        <img src="${apartment.image}" class="w-full h-64 object-cover rounded mb-4" alt="${apartment.title}" />
        <p class="mb-4 text-gray-600">${apartment.description}</p>
  
        <form id="reservation-form" class="space-y-4">
          <input type="text" id="name" placeholder="Adınız" class="w-full border p-2 rounded" required />
          <input type="date" id="startDate" class="w-full border p-2 rounded" required />
          <input type="date" id="endDate" class="w-full border p-2 rounded" required />
          <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded">
            Rezervasiya et
          </button>
        </form>
  
        <div id="success-message" class="text-green-600 mt-4 hidden">
          ✅ Rezervasiya uğurla tamamlandı!
        </div>
      </div>
    `;
  
    // Form submit
    const form = document.getElementById("reservation-form");
    const successMsg = document.getElementById("success-message");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const name = document.getElementById("name").value.trim();
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
  
      if (!name || !startDate || !endDate) {
        alert("Zəhmət olmasa bütün sahələri doldurun.");
        return;
      }
  
      const reservationData = {
        name,
        startDate,
        endDate,
        apartmentId: apartment.id
      };
  
      fetch("http://localhost:8000/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reservationData)
      })
        .then(res => res.json())
        .then(data => {
          console.log("Rezervasiya edildi:", data);
          successMsg.classList.remove("hidden");
          form.reset();
        })
        .catch(err => {
          console.error("Rezervasiya alınmadı:", err);
          alert("Xəta baş verdi, zəhmət olmasa sonra yenidən cəhd edin.");
        });
    });
  }
  