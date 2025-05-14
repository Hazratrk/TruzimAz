document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const apartmentId = urlParams.get("id");
    const API_URL = `http://localhost:8000/apartments/${apartmentId}`;
    const REVIEWS_API = "http://localhost:8000/reviews";
    const currentUser = getCurrentUser(); // auth.js-dən gəlir
  
    // Review form submission
    document.getElementById("review-form").addEventListener("submit", function(e) {
      e.preventDefault();
      
      const text = document.getElementById("review-text").value.trim();
      const author = currentUser ? currentUser.fullname || currentUser.username : "Anonim istifadəçi";
      
      if (!text) {
        alert("Zəhmət olmasa rəy yazın");
        return;
      }
  
      const reviewData = {
        apartmentId: apartmentId,
        author: author,
        content: text,
        createdAt: new Date().toISOString(),
        userId: currentUser ? currentUser.id : null
      };
  
      fetch(REVIEWS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData)
      })
      .then(response => response.json())
      .then(newReview => {
        document.getElementById("review-form").reset();
        addReviewToDOM({
          ...newReview,
          author: author // Əmin oluruq ki, author düzgün göstərilsin
        });
      })
      .catch(error => {
        console.error("Error submitting review:", error);
        alert("Rəy göndərilərkən xəta baş verdi");
      });
    });
  
    // ... digər funksiyalar eyni qalır ...
    
    function addReviewToDOM(review) {
      const reviewList = document.getElementById("review-list");
      const reviewItem = document.createElement("div");
      reviewItem.className = "review-item bg-gray-50 p-4 rounded-lg mb-3";
      
      reviewItem.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <span class="font-medium">${review.author}</span>
          <span class="text-sm text-gray-500">
            ${new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p class="text-gray-700">${review.content}</p>
      `;
      
      reviewList.prepend(reviewItem);
    }
  });
  