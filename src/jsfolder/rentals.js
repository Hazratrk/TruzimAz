document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const rentalsContainer = document.getElementById('rentalsContainer');

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

   
    fetch(`http://localhost:8000/reservations?userId=${user.id}`)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(rentals => {
            if (rentals.length === 0) {
                rentalsContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-home text-4xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">Hələ kirayə etməmisiniz</p>
                        <a href="apartments.html" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Apartamentlərə bax
                        </a>
                    </div>
                `;
                return;
            }

            let html = `
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartament</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarix</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qiymət</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
            `;

            rentals.forEach(rental => {
                html += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <img class="h-10 w-10 rounded-full" src="${rental.apartmentImage || 'https://via.placeholder.com/150'}" alt="">
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">${rental.apartmentTitle || 'Naməlum'}</div>
                                    <div class="text-sm text-gray-500">${rental.apartmentLocation || ''}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}</div>
                            <div class="text-sm text-gray-500">${calculateDays(rental.startDate, rental.endDate)} gün</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${rental.totalPrice} AZN
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${rental.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                ${rental.status === 'completed' ? 'Tamamlandı' : 'Gözləyir'}
                            </span>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            rentalsContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            rentalsContainer.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>Xəta baş verdi: ${error.message}</p>
                    <button onclick="window.location.reload()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                        Yenidən yüklə
                    </button>
                </div>
            `;
        });
});

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('az-AZ', options);
}

function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
}