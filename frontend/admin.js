const reservationList = document.getElementById("reservationList");
const blockList = document.getElementById("blockList");
const blockBtn = document.getElementById("blockBtn");
const blockMessage = document.getElementById("blockMessage");

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
                <p><strong>Room ID:</strong> ${block.room_id}</p>
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
    const room_id = document.getElementById("roomId").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const reason = document.getElementById("reason").value;

    if (!room_id || !startDate || !endDate) {
        blockMessage.textContent = "Please fill in room ID, start date, and end date.";
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

        document.getElementById("roomId").value = "";
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

blockBtn.addEventListener("click", blockRoom);

loadReservations();
loadBlocks();