document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('register-form');
  const errorContainer = document.getElementById('error-container');
  const userTypeUser = document.getElementById('userTypeUser');
  const userTypeAdmin = document.getElementById('userTypeAdmin');
  const adminFields = document.getElementById('adminFields');
  
  let isAdmin = false;

  // user type
  userTypeUser.addEventListener('click', function(e) {
      e.preventDefault();
      isAdmin = false;
      userTypeUser.classList.add('bg-blue-600', 'text-white');
      userTypeUser.classList.remove('bg-gray-200', 'hover:bg-gray-300');
      userTypeAdmin.classList.add('bg-gray-200', 'hover:bg-gray-300');
      userTypeAdmin.classList.remove('bg-blue-600', 'text-white');
      adminFields.classList.add('hidden');
      document.querySelector('h2').textContent = 'New user Register';
  });

  userTypeAdmin.addEventListener('click', function(e) {
      e.preventDefault();
      isAdmin = true;
      userTypeAdmin.classList.add('bg-blue-600', 'text-white');
      userTypeAdmin.classList.remove('bg-gray-200', 'hover:bg-gray-300');
      userTypeUser.classList.add('bg-gray-200', 'hover:bg-gray-300');
      userTypeUser.classList.remove('bg-blue-600', 'text-white');
      adminFields.classList.remove('hidden');
      document.querySelector('h2').textContent = 'New admin Register';
  });

  registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Form data
      const userData = {
          fullname: document.getElementById('fullname').value.trim(),
          username: document.getElementById('username').value.trim(),
          email: document.getElementById('email').value.trim(),
          password: document.getElementById('password').value.trim(),
          confirm_password: document.getElementById('confirm_password').value.trim(),
          isAdmin: isAdmin,
          adminCode: document.getElementById('adminCode')?.value.trim() || null
      };

      // Validasiya
      if (userData.password !== userData.confirm_password) {
          showError('Passwords do not match.!');
          return;
      }

      // Admin login yoxlanisi
      if (userData.isAdmin && (!userData.adminCode || userData.adminCode !== "123456")) {
          showError('Invalid admin code!!');
          return;
      }

      try {
    
          const response = await fetch('http://localhost:8000/users');
          if (!response.ok) throw new Error('API error');
          const users = await response.json();

          // İstifadəçinin artıq mövcud olub olmadığını yoxla
          const userExists = users.some(user => 
              user.email === userData.email || user.username === userData.username
          );

          if (userExists) {
              showError('This email or username is already in use!');
              return;
          }

   
          const newUser = {
              fullname: userData.fullname,
              username: userData.username,
              email: userData.email,
              password: userData.password,
              role: userData.isAdmin ? 'admin' : 'user',
              createdAt: new Date().toISOString()
          };

          // API-POST 
          const registerResponse = await fetch('http://localhost:8000/users', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(newUser)
          });

          if (!registerResponse.ok) throw new Error('Registration failed');

          //suc login
          showSuccess(userData.isAdmin ? 
              'admin registration successful! You are redirected to the admin panel...' : 
              'Registration successful! You are being redirected to the login page...');

          // 3 sec after
          setTimeout(() => {
              if (userData.isAdmin) {
                  localStorage.setItem('currentAdmin', JSON.stringify(newUser));
                  window.location.href = 'admin/dashboard.html';
              } else {
                  window.location.href = 'login.html';
              }
          }, 3000);

      } catch (error) {
          console.error('Registration error:', error);
          showError('An error occurred, please try again.');
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
// login for admin
const newUser = {
    
    role: isAdmin ? 'admin' : 'user'
};