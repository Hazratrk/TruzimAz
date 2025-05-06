document.getElementById('register-form').addEventListener('submit', function (event) {
    event.preventDefault();
  
    const formData = {
      fullname: document.getElementById('fullname').value,
      lastname: document.getElementById('lastname').value,
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      confirm_password: document.getElementById('confirm_password').value
    };
  
    if (formData.password !== formData.confirm_password) {
      displayError('Şifrə və təsdiqləmə şifrəsi eyni olmalıdır.');
      return;
    }
  
    
    fetch('http://localhost:8000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullname: formData.fullname,
        lastname: formData.lastname
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Server cavab vermədi");
        }
        return response.json();
      })
      .then(data => {
        window.location.href = '/login.html';
      })
      .catch(error => {
        console.error('Fetch Error:', error);
        displayError('Serverlə əlaqə qurulmadı.');
      });
  });
  
  function displayError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<p class="text-red-600 text-center">${message}</p>`;
  }