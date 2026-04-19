const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");

async function searchHotels() {
    const q = searchInput.value.trim();

    const res = await fetch(`/api/hotels?q=${encodeURIComponent(q)}`);  const hotels = await res.json();

    results.innerHTML = "";

    if (hotels.length === 0) {
        results.innerHTML = "<p>No hotels found.</p>";
        return;
    }

    hotels.forEach(hotel => {
        const div = document.createElement("div");
        div.className = "hotel-card";
        div.innerHTML = `
        <h3>${hotel.name}</h3>
        <p><strong>City:</strong> ${hotel.city}</p>
        <p><strong>Area:</strong> ${hotel.area ?? ""}</p>
        <p><strong>Stars:</strong> ${hotel.starRating ?? ""}</p>
        <p>${hotel.description ?? ""}</p>
        `;
        results.appendChild(div);
    });
}

searchBtn.addEventListener("click", searchHotels);