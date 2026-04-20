const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${parseInt(day)}-${parseInt(month)}-${year.slice(2)}`;
}

async function searchHotels() {
    const q = searchInput.value.trim();

    const res = await fetch(`/api/hotels?q=${encodeURIComponent(q)}`);
    const hotels = await res.json();

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

        <button onclick="loadRooms(${hotel.hotel_id})">Show Rooms</button>

        <div id="rooms-${hotel.hotel_id}" class="rooms-box"></div>
        `;
        results.appendChild(div);
    });
}

async function loadRooms(hotelId) {
    const roomsBox = document.getElementById(`rooms-${hotelId}`);

    try {
        const res = await fetch(`/api/rooms/${hotelId}`);
        const rooms = await res.json();

        roomsBox.innerHTML = "";

        if (!Array.isArray(rooms) || rooms.length === 0) {
            roomsBox.innerHTML = "<p>No rooms found.</p>";
            return;
        }

        rooms.forEach(room => {
            const div = document.createElement("div");
            div.className = "room-card";
            div.innerHTML = `
                <p><strong>Room:</strong> ${room.roomNumber}</p>
                <p><strong>Type:</strong> ${room.roomType}</p>
                <p><strong>Status:</strong> ${room.status}</p>
                <p><strong>Max guests:</strong> ${room.maxguests}</p>
                <p><strong>Price per night:</strong> ${room.pricePerNight} ISK</p>

                <button onclick="toggleRoomForm(${room.room_id})">Book This Room</button>

                <div id="room-form-${room.room_id}" class="booking-form hidden">
                    <label>Name:</label>
                    <input type="text" id="name-${room.room_id}">

                    <label>Phone:</label>
                    <input type="text" id="phone-${room.room_id}">

                    <label>Check-in:</label>
                    <input type="date" id="checkin-${room.room_id}">

                    <label>Check-out:</label>
                    <input type="date" id="checkout-${room.room_id}">

                    <label>Guests:</label>
                    <input type="number" id="guests-${room.room_id}" min="1" value="1">

                    <button onclick="bookRoom(${room.room_id}, ${room.maxguests}, ${room.pricePerNight})">Confirm Booking</button>
                    <p id="msg-${room.room_id}" class="msg"></p>
                </div>
            `;
            roomsBox.appendChild(div);
        });
    } catch (err) {
        roomsBox.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

function toggleRoomForm(roomId) {
    const form = document.getElementById(`room-form-${roomId}`);
    form.classList.toggle("hidden");
}

async function bookRoom(roomId, maxGuests, pricePerNight) {
    const name = document.getElementById(`name-${roomId}`).value;
    const phone = document.getElementById(`phone-${roomId}`).value;
    const checkIn = document.getElementById(`checkin-${roomId}`).value;
    const checkOut = document.getElementById(`checkout-${roomId}`).value;
    const guestCount = parseInt(document.getElementById(`guests-${roomId}`).value);

    const msg = document.getElementById(`msg-${roomId}`);

    if (!name || !phone || !checkIn || !checkOut || !guestCount) {
        msg.textContent = "Please fill all fields.";
        msg.style.color = "red";
        return;
    }

    if (guestCount > maxGuests) {
        msg.textContent = `Max guests for this room is ${maxGuests}.`;
        msg.style.color = "red";
        return;
    }

    const formattedCheckIn = formatDate(checkIn);
    const formattedCheckOut = formatDate(checkOut);

    try {
        const res = await fetch("/api/reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                room_id: roomId,
                name,
                phone,
                check_in: formattedCheckIn,
                check_out: formattedCheckOut,
                guestCount
            })
        });

        const data = await res.json();

        if (!res.ok) {
            msg.textContent = "Error: " + (data.error || "Failed");
            msg.style.color = "red";
            return;
        }

        msg.textContent = `Reservation successful! Price per night: ${pricePerNight} ISK`;
        msg.style.color = "green";
    } catch (err) {
        msg.textContent = "Error: " + err.message;
        msg.style.color = "red";
    }
}

searchBtn.addEventListener("click", searchHotels);