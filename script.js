const API_BASE = 'http://localhost:8080/api/trips';
const tripsContainer = document.getElementById('tripsContainer');

const filterDestination = document.getElementById('filterDestination');
const filterStatus = document.getElementById('filterStatus');
const filterStart = document.getElementById('filterStart');   // NEW
const filterEnd = document.getElementById('filterEnd');       // NEW

const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');

// Core fetcher
async function fetchTrips({ destination = '', status = '', start = '', end = '' } = {}) {
  let url;

  const hasDateRange = start && end;
  const hasDestination = destination && destination.trim() !== '';
  const hasStatus = status && status.trim() !== '';

  if (hasDateRange) {
    // 1) Use daterange API
    const qs = new URLSearchParams({
      start,
      end,
    }).toString();
    url = `${API_BASE}/daterange?${qs}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.content || []);

      // 2) Apply dest/status filters client-side (since daterange is already applied server-side)
      return list.filter(trip => {
        const okDest = !hasDestination || (trip.destination || '').toLowerCase().includes(destination.trim().toLowerCase());
        const okStatus = !hasStatus || (trip.status || '').toUpperCase() === status.trim().toUpperCase();
        return okDest && okStatus;
      });
    } catch (err) {
      alert('Error loading trips: ' + err.message);
      return [];
    }
  } else if (hasDestination) {
    // Your existing search by destination
    url = `${API_BASE}/search?destination=${encodeURIComponent(destination)}`;
  } else if (hasStatus) {
    // Your existing filter by status
    url = `${API_BASE}/filter?status=${encodeURIComponent(status)}`;
  } else {
    // Default list (paged)
    url = `${API_BASE}?page=0&size=20&sort=startDate,asc`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.content || data; // paginated or plain
  } catch (err) {
    alert('Error loading trips: ' + err.message);
    return [];
  }
}

function createTripCard(trip) {
  const imgUrl = `https://picsum.photos/400/250?random=${trip.id}`;
  const price = typeof trip.price === 'number' ? trip.price.toFixed(2) : trip.price;

  return `
    <div class="col-md-4">
      <div class="card h-100">
        <img src="${imgUrl}" class="card-img-top" alt="Trip Image" />
        <div class="card-body">
          <h5 class="card-title">${trip.destination}</h5>
          <p class="card-text">
            Status: <strong>${trip.status}</strong><br />
            Price: $${price}<br />
            Dates: ${trip.startDate} - ${trip.endDate}
          </p>
          <a href="tripForm.html?id=${trip.id}" class="btn btn-outline-primary btn-sm">Edit Trip</a>
        </div>
      </div>
    </div>
  `;
}

async function loadTripsWithFilters() {
  const destination = filterDestination.value.trim();
  const status = filterStatus.value.trim();
  const start = filterStart.value; // YYYY-MM-DD
  const end = filterEnd.value;     // YYYY-MM-DD

  // Validate date range if one is provided
  if ((start && !end) || (!start && end)) {
    alert('Please provide both Start and End dates.');
    return;
  }
  if (start && end) {
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) {
      alert('End date should be the same or after Start date.');
      return;
    }
  }

  const trips = await fetchTrips({ destination, status, start, end });
  tripsContainer.innerHTML =
    trips.length ? trips.map(createTripCard).join('') : `<p>No trips found.</p>`;
}

applyFiltersBtn.addEventListener('click', loadTripsWithFilters);

resetFiltersBtn.addEventListener('click', () => {
  filterDestination.value = '';
  filterStatus.value = '';
  filterStart.value = '';
  filterEnd.value = '';
  loadTripsWithFilters();
});

// Load trips on page load
loadTripsWithFilters();
