const form = document.getElementById("addApartmentForm");
const apartmentsContainer = document.getElementById("apartmentsContainer");

const API_URL = "http://localhost:8000/apartments";
let editingId = null;

// Mənzili kart kimi göstərmək
function renderApartment(apartment) {
  const card = document.createElement("div");
  card.className = "bg-white border rounded-xl shadow-md overflow-hidden";
  card.innerHTML = `
    <img src="${apartment.image}" alt="${apartment.title}" class="w-full h-48 object-cover">
    <div class="p-4">
      <h3 class="text-lg font-semibold">${apartment.title}</h3>
      <p class="text-sm text-gray-600">${apartment.location}</p>
      <p class="text-teal-600 font-bold">₼${apartment.nightPrice}</p>
      <p class="text-sm mt-2">${apartment.description}</p>
      <div class="mt-4 flex space-x-3">
        <button class="text-blue-600 hover:underline edit-btn" data-id="${apartment.id}">Düzəlt</button>
        <button class="text-red-600 hover:underline delete-btn" data-id="${apartment.id}">Sil</button>
      </div>
    </div>
  `;
  apartmentsContainer.appendChild(card);
}

// Bütün mənzilləri yüklə
async function loadApartments() {
  apartmentsContainer.innerHTML = "";
  try {
    const res = await fetch(API_URL);
    const apartments = await res.json();
    apartments.forEach(renderApartment);
  } catch (error) {
    console.error("Mənzillər yüklənmədi:", error);
  }
}

// Form submit — əlavə və ya düzəliş
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newApartment = {
    title: document.getElementById("apartmentTitle").value,
    location: document.getElementById("apartmentLocation").value,
    nightPrice: +document.getElementById("apartmentPrice").value,
    image: document.getElementById("apartmentImage").value,
    description: document.getElementById("apartmentDescription").value,
  };

  try {
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApartment),
      });
      editingId = null;
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApartment),
      });
    }

    form.reset();
    loadApartments();
  } catch (error) {
    console.error("Əlavə/Düzəltmə xətası:", error);
  }
});


apartmentsContainer.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;


  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Bu mənzili silmək istədiyinizə əminsiniz?")) {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      loadApartments();
    }
  }

  // Redaktə etmək
  if (e.target.classList.contains("edit-btn")) {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const apartment = await res.json();

      document.getElementById("apartmentTitle").value = apartment.title;
      document.getElementById("apartmentLocation").value = apartment.location;
      document.getElementById("apartmentPrice").value = apartment.nightPrice;
      document.getElementById("apartmentImage").value = apartment.image;
      document.getElementById("apartmentDescription").value = apartment.description;

      editingId = id;
      window.scrollTo({ top: 0, behavior: "smooth" }); // Formu göstərin
    } catch (error) {
      console.error("Redaktə xətası:", error);
    }
  }
});

// İlk yüklənmə
loadApartments();
