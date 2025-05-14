document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get('id');
  const API_URL = `http://localhost:8000/apartments/${apartmentId}`;
  const REVIEWS_API = 'http://localhost:8000/reviews';

  // Apartment details
  fetch(API_URL)
    .then(response => response.json())
    .then(apartment => {
      renderApartmentDetails(apartment);
      loadReviews(apartment.id);
    })
    .catch(error => {
      console.error('Error fetching apartment details:', error);
      document.getElementById('apartment-detail').innerHTML = `
        <div class="p-6 text-center">
          <p class="text-red-500">Error loading apartment details. Please try again later.</p>
        </div>
      `;
    });

  // Review form submission
  document.getElementById('review-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const author = document.getElementById('review-author').value.trim();
    const text = document.getElementById('review-text').value.trim();
    
    if (!author || !text) {
      alert('Please fill in all fields');
      return;
    }

    const reviewData = {
      apartmentId: apartmentId,
      author: author,
      content: text,
      createdAt: new Date().toISOString()
    };

    fetch(REVIEWS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData)
    })
    .then(response => response.json())
    .then(newReview => {
      // Clear form
      document.getElementById('review-form').reset();
      // Add new review to the list
      addReviewToDOM(newReview);
    })
    .catch(error => {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    });
  });

  function renderApartmentDetails(apartment) {
    const container = document.getElementById('apartment-detail');
    
    container.insertAdjacentHTML('afterbegin', `
      <div class="p-6">
        <h1 class="text-3xl font-bold mb-4">${apartment.title}</h1>
        <div class="flex items-center mb-4">
          <i class="fas fa-map-marker-alt text-gray-500 mr-2"></i>
          <span class="text-gray-700">${apartment.location}</span>
        </div>
        <p class="text-2xl font-bold text-blue-600 mb-6">₼${apartment.nightPrice} / night</p>
        
        <div class="image-gallery mb-8">
          <img src="${apartment.image}" alt="${apartment.title}" class="main-image rounded-lg">
        </div>
        
        <div class="mb-8">
          <h2 class="text-blue-700 text-xl font-bold mb-3">Description</h2>
          <p class="text-gray-700">${apartment.description}</p>
        </div>
        
        <div class="mb-8">
          <h2 class="text-xl text-blue-700 font-bold mb-3">Features</h2>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
            ${apartment.features.map(feature => `
              <li class="flex items-center text-blue-700 ">
                <i class="fas fa-check text-green-500 mr-2"></i>
                <span>${feature}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="mb-8">
          <h2 class="text-xl text-blue-700  font-bold mb-3">Rules</h2>
          <p class="text-gray-700">${apartment.rules}</p>
        </div>
      </div>
    `);
  }

  function loadReviews(apartmentId) {
    fetch(`${REVIEWS_API}?apartmentId=${apartmentId}`)
      .then(response => response.json())
      .then(reviews => {
        const reviewList = document.getElementById('review-list');
        
        if (reviews.length === 0) {
          reviewList.innerHTML = `
            <p class="text-blue-500 text-center py-4">No reviews yet. Be the first to review!</p>
          `;
          return;
        }
        
        reviewList.innerHTML = '';
        reviews.forEach(review => {
          addReviewToDOM(review);
        });
      })
      .catch(error => {
        console.error('Error loading reviews:', error);
        document.getElementById('review-list').innerHTML = `
          <p class="text-red-500">Error loading reviews. Please try again later.</p>
        `;
      });
  }

  function addReviewToDOM(review) {
    const reviewList = document.getElementById('review-list');
    const reviewItem = document.createElement('div');
    reviewItem.className = 'review-item';
    reviewItem.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <span class="review-author">${review.author}</span>
        <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <p class="text-gray-700">${review.content}</p>
    `;
    reviewList.prepend(reviewItem);
  }
});