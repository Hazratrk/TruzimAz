document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const emailInput = document.getElementById('email').value.trim();
  const passwordInput = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('errorMsg');

  // Validasiya
  if (!emailInput || !passwordInput) {
      errorMsg.textContent = "Fill all spaces!";
      return;
  }

  try {
      // API-dan istifadəçiləri al
      const response = await fetch('http://localhost:8000/users');
      if (!response.ok) throw new Error('API not working');
      
      const users = await response.json();

      // İstifadəçini tap
      const user = users.find(u => 
          (u.email === emailInput || u.username === emailInput) && 
          u.password === passwordInput
      );

      if (user) {
          // LocalStorage-a istifadəçi məlumatlarını saxla
          localStorage.setItem('loggedInUser', JSON.stringify({
              id: user.id,
              username: user.username,
              email: user.email,
              fullname: user.fullname,
              lastname: user.lastname,
              balance: user.balance || 0,
              registeredAt: user.createdAt || new Date().toISOString()
          }));
          
          // Profil
          window.location.href = '/profile.html';
      } else {
          errorMsg.textContent = 'wrong email/username or password!';
      }
  } catch (error) {
      console.error('Login error:', error);
      errorMsg.textContent = 'An error occurred,try again.';
  }
});