const API_BASE = 'http://localhost:8080/api/trips';
const tripForm = document.getElementById('tripForm');
const tripIdInput = document.getElementById('tripId');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');

// Extract ID from URL if editing (e.g., tripForm.html?id=5)
const urlParams = new URLSearchParams(window.location.search);
const tripId = urlParams.get('id');

if (tripId) {
  loadTrip(tripId);
}

// Load an existing trip for editing
async function loadTrip(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch trip');
    const trip = await res.json();

    // Pre-fill form fields
    tripIdInput.value = trip.id;
    document.getElementById('destination').value = trip.destination;
    document.getElementById('startDate').value = trip.startDate;
    document.getElementById('endDate').value = trip.endDate;
    document.getElementById('price').value = trip.price;
    document.getElementById('status').value = trip.status;

    formTitle.textContent = 'Edit Trip';
    submitBtn.textContent = 'Update Trip';

    let deleteBtn =  document.createElement('button');
    deleteBtn.innerText = "delete";
    deleteBtn.id = "delete"
    deleteBtn.className = submitBtn.className;
          deleteBtn.style.marginLeft = '10px'; // add small spacing
          deleteBtn.style.backgroundColor = '#dc3545'; // red background
          deleteBtn.style.color = 'white';
          deleteBtn.style.border = 'none';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.style.borderRadius = '4px';

          deleteBtn.addEventListener('click', async () => {
                  if (confirm('Are you sure you want to delete this trip?')) {
                    try {
                      const delRes = await fetch(`http://localhost:8080/api/trips/${trip.id}`, {
                        method: 'DELETE',
                      });
                      if (!delRes.ok) throw new Error('Failed to delete trip');
                      alert('Trip deleted successfully!');
                      // Reset form or reload data
                      document.querySelector('form').reset();
                      formTitle.textContent = 'Add New Trip';
                      submitBtn.textContent = 'Add Trip';
                      deleteBtn.remove();
                    } catch (err) {
                      alert(err.message);
                    }
                  }
                });

    submitBtn.parentNode.insertBefore(deleteBtn, submitBtn.nextSibling);
  } catch (err) {
    alert(err.message);
  }
}

// Submit Form
tripForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const trip = {
    destination: document.getElementById('destination').value.trim(),
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    price: parseFloat(document.getElementById('price').value),
    status: document.getElementById('status').value
  };

  try {
    let res;
    if (tripIdInput.value) {
      // Update
      res = await fetch(`${API_BASE}/${tripIdInput.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip)
      });
    } else {
      // Create
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip)
      });
    }

    if (res.ok) {
      alert('Trip saved successfully!');
      window.location.href = 'trips.html';
    } else {
      alert('Error saving trip.');
    }
  } catch (error) {
    alert('Failed to save: ' + error.message);
  }
});

// Reset Form
resetBtn.addEventListener('click', () => {
  tripForm.reset();
});
