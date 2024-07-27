document.getElementById('prayerRequestForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        prayerRequest: document.getElementById('prayerRequest').value
    };

    try {
        const response = await fetch('https://gmc.onrender.com/prayer-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Prayer request sent successfully!');
            document.getElementById('prayerRequestForm').reset();
        } else {
            alert('Failed to send prayer request. Please try again.');
        }
    } catch (error) {
        alert('An error occurred. Please try again later.');
        console.error('Error:', error);
    }
});
