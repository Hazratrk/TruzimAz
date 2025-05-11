document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

   
    if (user) {
        document.getElementById('name').value = `${user.fullname || ''} ${user.lastname || ''}`.trim();
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form 
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value.trim(),
            userId: user ? user.id : null,
            createdAt: new Date().toISOString()
        };

        // API-
        fetch('http://localhost:8000/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
        
            successMessage.classList.remove('hidden');
            contactForm.reset();
            
          
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 5000);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred.: ' + error.message);
        });
    });
});