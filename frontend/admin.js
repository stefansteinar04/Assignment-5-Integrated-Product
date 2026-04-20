const reservationList = document.getElementById("reservationList");

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
                <p><strong>Room ID:</strong> ${r.room_id}</p>
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

loadReservations();