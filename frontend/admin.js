const reservationList = document.getElementById("reservationList");
const blockList = document.getElementById("blockList");
const blockBtn = document.getElementById("blockBtn");
const blockMessage = document.getElementById("blockMessage");

const hotelSelect = document.getElementById("hotelSelect");
const roomSelect = document.getElementById("roomSelect");

async function loadHotelsForAdmin() {
    try {
        const res = await fetch("/api/hotels?q=");
        const hotels = await res.json();

        hotelSelect.innerHTML = "";

        if (!Array.isArray(hotels) || hotels.length === 0) {
            hotelSelect.innerHTML = `<option value="">No hotels found</option>`;
            roomSelect.innerHTML = `<option value="">No rooms available</option>`;
            return;
        }

        hotels.forEach(hotel => {
            const option = document.createElement("option");
            option.value = hotel.hotel_id;
            option.textContent = `${hotel.name} - ${hotel.city}`;
            hotelSelect.appendChild(option);
        });

        await loadRoomsForSelectedHotel();
    } catch (err) {
        hotelSelect.innerHTML = `<option value="">Error loading hotels</option>`;
        roomSelect.innerHTML = `<option value="">Error loading rooms</option>`;
    }
}

async function loadRoomsForSelectedHotel() {
    const hotelId = hotelSelect.value;

    roomSelect.innerHTML = "";

    if (!hotelId) {
        roomSelect.innerHTML = `<option value="">Select a hotel first</option>`;
        return;
    }

    try {
        const res = await fetch(`/api/rooms/${hotelId}`);
        const rooms = await res.json();

        if (!Array.isArray(rooms) || rooms.length === 0) {
            roomSelect.innerHTML = `<option value="">No rooms found</option>`;
            return;
        }

        rooms.forEach(room => {
            const option = document.createElement("option");
            option.value = room.room_id;
            option.textContent = `Room ${room.roomNumber} - ${room.roomType}`;
            roomSelect.appendChild(option);
        });
    } catch (err) {
        roomSelect.innerHTML = `<option value="">Error loading rooms</option>`;
    }
}

async function loadReservations() {
    try {
        const res = await fetch("/api/reservations");
        const reservations = await res.json();

        reservationList.innerHTML = "";

        if (!Array.isArray(reservations) || reservations.length === 0) {
            reservationList.innerHTML = "<p>No reservations found.</p>";
            return;
        }

        reservations.forEach(r => {
            const div = document.createElement("div");
            div.className = "room-card";
            div.innerHTML = `
                <p><strong>ID:</strong> ${r.reservation_id}</p>
                <p><strong>Hotel:</strong> ${r.hotelName || "Unknown hotel"}</p>
                <p><strong>Room ID:</strong> ${r.room_id}</p>
                <p><strong>Room Number:</strong> ${r.roomNumber ?? ""}</p>
                <p><strong>Status:</strong> ${r.status}</p>
                <p><strong>Name:</strong> ${r.name}</p>
                <p><strong>Phone:</strong> ${r.phone}</p>
                <p><strong>Check-in:</strong> ${r.checkInDate}</p>
                <p><strong>Check-out:</strong> ${r.checkOutDate}</p>
                <p><strong>Guests:</strong> ${r.guestCount}</p>
            `;
            reservationList.appendChild(div);
        });
    } catch (err) {
        reservationList.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

async function loadBlocks() {
    try {
        const res = await fetch("/api/blocks");
        const blocks = await res.json();

        blockList.innerHTML = "";

        if (!Array.isArray(blocks) || blocks.length === 0) {
            blockList.innerHTML = "<p>No blocked dates found.</p>";
            return;
        }

        blocks.forEach(block => {
            const div = document.createElement("div");
            div.className = "room-card";
            div.innerHTML = `
                <p><strong>Block ID:</strong> ${block.block_id}</p>
                <p><strong>Hotel:</strong> ${block.hotelName || "Unknown hotel"}</p>
                <p><strong>Room ID:</strong> ${block.room_id}</p>
                <p><strong>Room Number:</strong> ${block.roomNumber ?? ""}</p>
                <p><strong>Start:</strong> ${block.startDate}</p>
                <p><strong>End:</strong> ${block.endDate}</p>
                <p><strong>Reason:</strong> ${block.reason || ""}</p>
                <button type="button" onclick="deleteBlock(${block.block_id})">Remove Block</button>
            `;
            blockList.appendChild(div);
        });
    } catch (err) {
        blockList.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

async function blockRoom() {
    const room_id = roomSelect.value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const reason = document.getElementById("reason").value;

    if (!room_id || !startDate || !endDate) {
        blockMessage.textContent = "Please fill in room, start date, and end date.";
        blockMessage.style.color = "red";
        return;
    }

    if (startDate >= endDate) {
        blockMessage.textContent = "End date must be after start date.";
        blockMessage.style.color = "red";
        return;
    }

    try {
        const res = await fetch("/api/blocks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                room_id,
                startDate,
                endDate,
                reason
            })
        });

        const data = await res.json();

        if (!res.ok) {
            blockMessage.textContent = "Error: " + (data.error || "Failed");
            blockMessage.style.color = "red";
            return;
        }

        blockMessage.textContent = "Blocked dates saved successfully.";
        blockMessage.style.color = "green";

        document.getElementById("startDate").value = "";
        document.getElementById("endDate").value = "";
        document.getElementById("reason").value = "";

        loadBlocks();
    } catch (err) {
        blockMessage.textContent = "Error: " + err.message;
        blockMessage.style.color = "red";
    }
}

async function deleteBlock(blockId) {
    try {
        const res = await fetch(`/api/blocks/${blockId}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok) {
            alert("Error: " + (data.error || "Failed"));
            return;
        }

        loadBlocks();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

hotelSelect.addEventListener("change", loadRoomsForSelectedHotel);
blockBtn.addEventListener("click", blockRoom);

loadHotelsForAdmin();
loadReservations();
loadBlocks();