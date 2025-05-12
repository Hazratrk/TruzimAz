document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const errorContainer = document.getElementById('error-container');
  
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
  
        // Form data
        const userData = {
            fullname: document.getElementById('fullname').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value.trim(),
            confirm_password: document.getElementById('confirm_password').value.trim()
        };
  
        // Validation
        if (userData.password !== userData.confirm_password) {
            showError('Şifrələr uyğun gəlmir!');
            return;
        }
  
        try {
            // Check if user exists
            const response = await fetch('http://localhost:8000/users');
            if (!response.ok) throw new Error('API xətası');
            const users = await response.json();
  
            const userExists = users.some(user => 
                user.email === userData.email || user.username === userData.username
            );
  
            if (userExists) {
                showError('Bu email və ya istifadəçi adı artıq istifadə olunur!');
                return;
            }
  
            // Create new user
            const newUser = {
                fullname: userData.fullname,
                username: userData.username,
                email: userData.email,
                password: userData.password,
                role: 'user',
                createdAt: new Date().toISOString()
            };
  
            // Register user
            const registerResponse = await fetch('http://localhost:8000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
  
            if (!registerResponse.ok) throw new Error('Qeydiyyat uğursuz oldu');
  
            // Show success message
            showSuccess('Qeydiyyat uğurla tamamlandı! Giriş səhifəsinə yönləndirilirsiniz...');
  
            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
  
        } catch (error) {
            console.error('Qeydiyyat xətası:', error);
            showError('Xəta baş verdi, zəhmət olmasa yenidən cəhd edin.');
        }
    });
  
    function showError(message) {
        errorContainer.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                ${message}
            </div>
        `;
    }
  
    function showSuccess(message) {
        errorContainer.innerHTML = `
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                ${message}
            </div>
        `;
    }
  });