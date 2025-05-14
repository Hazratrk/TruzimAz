document.addEventListener("DOMContentLoaded", () => {
    const reviewsTable = document.getElementById("reviewsTable");
    const loadingIndicator = document.getElementById("loadingIndicator");
  
    async function loadReviews() {
      try {
        showLoading(true);
  
        const [reviewsRes, apartmentsRes] = await Promise.all([
          fetch("http://localhost:8000/reviews"),
          fetch("http://localhost:8000/apartments")
        ]);
  
        if (!reviewsRes.ok || !apartmentsRes.ok) {
          throw new Error('Verilənlər alınarkən xəta baş verdi');
        }
  
        const reviews = await reviewsRes.json();
        const apartments = await apartmentsRes.json();
  
        // Mənzil adlarını əldə etmək üçün mapping
        const apartmentMap = {};
        apartments.forEach(apt => {
          apartmentMap[apt.id] = apt.title;
        });
  
        renderReviews(reviews, apartmentMap);
      } catch (error) {
        console.error("Xəta:", error);
        showError("Rəylər yüklənərkən xəta baş verdi");
      } finally {
        showLoading(false);
      }
    }
  
    function renderReviews(reviews, apartmentMap) {
      reviewsTable.innerHTML = '';
  
      if (reviews.length === 0) {
        reviewsTable.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              Heç bir rəy tapılmadı
            </td>
          </tr>
        `;
        return;
      }
  
      reviews.forEach(review => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
          <td class="px-6 text-blue-600 py-4 whitespace-nowrap">${review.id}</td>
          <td class="px-6 text-blue-600 py-4 whitespace-nowrap">
            ${apartmentMap[review.apartmentId] || 'Mənzil silinib'}
          </td>
          <td class="px-6 text-blue-600 py-4 whitespace-nowrap">
            ${review.author || 'Anonim istifadəçi'}
          </td>
          <td class="px-6 text-blue-600 py-4 max-w-xs truncate" title="${review.content}">
            ${review.content}
          </td>
          <td class="px-6 text-blue-600 py-4 whitespace-nowrap">
            ${new Date(review.createdAt).toLocaleDateString()}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <button data-id="${review.id}" 
              class="delete-review-btn px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
              Sil
            </button>
          </td>
        `;
        reviewsTable.appendChild(row);
      });
    }
  
    // Sil düyməsi üçün event delegation
    reviewsTable.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-review-btn")) {
        const id = e.target.getAttribute("data-id");
        await deleteReview(id);
      }
    });
  
    async function deleteReview(id) {
      try {
        const review = await fetchReview(id);
  
        const isConfirmed = confirm(
          `"${review.content.substring(0, 30)}..." rəyini silmək istədiyinizə əminsiniz?\n\n` +
          `Yazan: ${review.author || 'Anonim'}\n` +
          `Tarix: ${new Date(review.createdAt).toLocaleDateString()}`
        );
  
        if (!isConfirmed) return;
  
        showLoading(true);
        const response = await fetch(`http://localhost:8000/reviews/${id}`, {
          method: "DELETE"
        });
  
        if (!response.ok) throw new Error('Silinmə zamanı xəta baş verdi');
  
        loadReviews(); // Siyahını yenilə
        showSuccess("Rəy uğurla silindi");
      } catch (error) {
        console.error("Xəta:", error);
        showError("Rəy silinərkən xəta baş verdi: " + error.message);
      } finally {
        showLoading(false);
      }
    }
  
    async function fetchReview(id) {
      const response = await fetch(`http://localhost:8000/reviews/${id}`);
      if (!response.ok) throw new Error('Rəy tapılmadı');
      return await response.json();
    }
    async function deleteReview(id) {
        try {
          const review = await fetchReview(id);
      
          // content sahəsinin yoxlanması və mətni olmadan da silmə icazəsi
          const contentPreview = review.content ? review.content.substring(0, 30) : 'Mətn yoxdur';
          const author = review.author || 'Anonim';
          const createdAt = new Date(review.createdAt).toLocaleDateString();
      
          const isConfirmed = confirm(
            `"${contentPreview}..." rəyini silmək istədiyinizə əminsiniz?\n\n` +
            `Yazan: ${author}\n` +
            `Tarix: ${createdAt}`
          );
      
          if (!isConfirmed) return;
      
          showLoading(true);
          const response = await fetch(`http://localhost:8000/reviews/${id}`, {
            method: "DELETE"
          });
      
          if (!response.ok) throw new Error('Silinmə zamanı xəta baş verdi');
      
          loadReviews(); // Siyahını yenilə
          showSuccess("Rəy uğurla silindi");
        } catch (error) {
          console.error("Xəta:", error);
          showError("Rəy silinərkən xəta baş verdi: " + error.message);
        } finally {
          showLoading(false);
        }
      }
      
    // Yardımcı funksiyalar
    function showLoading(show) {
      loadingIndicator.style.display = show ? 'block' : 'none';
    }
  
    function showError(message) {
      alert(`Xəta: ${message}`);
    }
  
    function showSuccess(message) {
      alert(`Uğurlu: ${message}`);
    }
  
    // Səhifə yüklənəndə rəyləri yüklə
    loadReviews();
  });
  