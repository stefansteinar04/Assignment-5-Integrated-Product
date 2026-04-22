const hotelDb = require("../storage/hotelDb");
const reservationDb = require("../storage/reservationDb");

function createReservation(req, res) {
    const { room_id, name, phone, check_in, check_out, guestCount } = req.body;

    if (!room_id || !name || !phone || !check_in || !check_out || !guestCount) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (check_in >= check_out) {
        return res.status(400).json({ error: "Check-out date must be after check-in date" });
    }

    hotelDb.getRoomById(room_id, (err, room) => {
        if (err) {
            console.error("Room lookup error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!room) {
            return res.status(400).json({ error: "Room not found" });
        }

        if (room.status !== "available") {
            return res.status(400).json({ error: "Room is not available" });
        }

        if (guestCount > room.maxguests) {
            return res.status(400).json({ error: "Too many guests for this room" });
        }

        reservationDb.findOverlappingReservation(room_id, check_in, check_out, (err, existing) => {
            if (err) {
                console.error("Reservation check error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (existing) {
                return res.status(400).json({ error: "Room is already reserved for those dates" });
            }

            reservationDb.findBlockedDates(room_id, check_in, check_out, (err, blocked) => {
                if (err) {
                    console.error("Blocked-date check error:", err.message);
                    return res.status(500).json({ error: err.message });
                }

                if (blocked) {
                    return res.status(400).json({ error: "Room is blocked for those dates" });
                }

                reservationDb.insertReservation(
                    room_id,
                    check_in,
                    check_out,
                    guestCount,
                    name,
                    phone,
                    function (err) {
                        if (err) {
                            console.error("Reservation insert error:", err.message);
                            return res.status(500).json({ error: err.message });
                        }

                        res.json({
                            success: true,
                            reservation_id: this.lastID,
                            pricePerNight: room.pricePerNight
                        });
                    }
                );
            });
        });
    });
}

function getReservations(req, res) {
    reservationDb.getAllReservations((err, rows) => {
        if (err) {
            console.error("Reservation fetch error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!rows.length) {
            return res.json([]);
        }

        let remaining = rows.length;
        const enrichedRows = [];

        rows.forEach((row, index) => {
            hotelDb.getRoomWithHotelById(row.room_id, (err, roomInfo) => {
                enrichedRows[index] = {
                    ...row,
                    hotelName: roomInfo ? roomInfo.hotelName : "Unknown hotel",
                    roomNumber: roomInfo ? roomInfo.roomNumber : null
                };

                remaining--;
                if (remaining === 0) {
                    res.json(enrichedRows);
                }
            });
        });
    });
}

function getBlocks(req, res) {
    reservationDb.getAllBlocks((err, rows) => {
        if (err) {
            console.error("Block fetch error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!rows.length) {
            return res.json([]);
        }

        let remaining = rows.length;
        const enrichedRows = [];

        rows.forEach((row, index) => {
            hotelDb.getRoomWithHotelById(row.room_id, (err, roomInfo) => {
                enrichedRows[index] = {
                    ...row,
                    hotelName: roomInfo ? roomInfo.hotelName : "Unknown hotel",
                    roomNumber: roomInfo ? roomInfo.roomNumber : null
                };

                remaining--;
                if (remaining === 0) {
                    res.json(enrichedRows);
                }
            });
        });
    });
}

function blockRoom(req, res) {
    const { room_id, startDate, endDate, reason } = req.body;

    if (!room_id || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (startDate >= endDate) {
        return res.status(400).json({ error: "End date must be after start date" });
    }

    reservationDb.insertBlock(room_id, startDate, endDate, reason || "", function (err) {
        if (err) {
            console.error("Block insert error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            success: true,
            block_id: this.lastID
        });
    });
}

function deleteBlock(req, res) {
    const { blockId } = req.params;

    reservationDb.deleteBlockById(blockId, function (err) {
        if (err) {
            console.error("Block delete error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Block not found" });
        }

        res.json({ success: true });
    });
}

module.exports = {
    createReservation,
    getReservations,
    getBlocks,
    blockRoom,
    deleteBlock
};