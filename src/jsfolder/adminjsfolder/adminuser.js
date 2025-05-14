document.addEventListener('DOMContentLoaded', async function() {
    const usersTable = document.getElementById('usersTable');
    const searchInput = document.getElementById('searchUsers');
    const reviewsContainer = document.getElementById('adminReviewsContainer');

    async function loadUsers(searchTerm = '') {
        try {
            const response = await fetch('http://localhost:8000/users');
            if (!response.ok) throw new Error('API error');
            const users = await response.json();

            const filteredUsers = users.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

            usersTable.innerHTML = '';
            filteredUsers.forEach(user => {
                const row = document.createElement('tr');
                const statusClass = user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
                const statusText = user.banned ? 'Banlı' : 'Aktiv';

                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 mr-3 edit-btn" data-id="${user.id}">Edit</button>
                        <button class="${user.banned ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'} mr-3 ban-btn" data-id="${user.id}">
                            ${user.banned ? 'Unban' : 'Ban'}
                        </button>
                        <button class="text-red-600 hover:text-red-900 delete-btn" data-id="${user.id}">Delete</button>
                    </td>
                `;
                usersTable.appendChild(row);
            });

            document.querySelectorAll('.ban-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const userId = this.getAttribute('data-id');
                    await toggleBanUser(userId);
                    await loadUsers(searchInput.value);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    deleteUser(userId);
                });
            });

        } catch (error) {
            console.error('Users load error:', error);
            alert('İstifadəçi məlumatları yüklənərkən xəta baş verdi');
        }
    }

    async function loadReviews() {
        try {
            const response = await fetch('http://localhost:8000/reviews');
            if (!response.ok) throw new Error('Review fetch error');
            const reviews = await response.json();

            reviewsContainer.innerHTML = reviews.map(review => `
                <div class="border p-4 rounded-md mb-3 bg-white shadow">
                    <div class="flex justify-between">
                        <div>
                            <p class="font-semibold text-gray-800">${review.username}</p>
                            <p class="text-sm text-gray-500">${review.apartmentTitle}</p>
                            <p class="mt-1 text-gray-600">${review.text}</p>
                        </div>
                        <button class="text-red-500 hover:text-red-700" onclick="deleteReview('${review.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (err) {
            console.error('Review load error:', err);
            reviewsContainer.innerHTML = '<p class="text-red-500">Rəylər yüklənə bilmədi.</p>';
        }
    }

    async function toggleBanUser(userId) {
        try {
            const response = await fetch(`http://localhost:8000/users/${userId}`);
            if (!response.ok) throw new Error('API error');
            const user = await response.json();

            const updatedUser = { ...user, banned: !user.banned };

            const updateResponse = await fetch(`http://localhost:8000/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUser)
            });

            if (!updateResponse.ok) throw new Error('Update failed');

        } catch (error) {
            console.error('Toggle ban error:', error);
            alert('İstifadəçi statusu dəyişdirilərkən xəta baş verdi');
        }
    }

    async function deleteUser(userId) {
        if (!confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) return;

        try {
            const response = await fetch(`http://localhost:8000/users/${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Delete failed');

            await loadUsers(searchInput.value);
            alert('İstifadəçi uğurla silindi');

        } catch (error) {
            console.error('Delete user error:', error);
            alert('İstifadəçi silinərkən xəta baş verdi');
        }
    }

    window.deleteReview = async function(id) {
        if (!confirm('Bu rəyi silmək istədiyinizə əminsiniz?')) return;

        try {
            const res = await fetch(`http://localhost:8000/reviews/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Review delete failed');

            await loadReviews();
        } catch (err) {
            console.error('Review delete error:', err);
            alert('Rəy silinərkən xəta baş verdi');
        }
    };

    searchInput.addEventListener('input', function() {
        loadUsers(this.value);
    });

    await loadUsers();
    await loadReviews();
});
