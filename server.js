const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("frontend"));

const hotelDb = new sqlite3.Database(
    path.join(__dirname, "src", "storage", "Hotel database.db")
);

const reservationDb = new sqlite3.Database(
    path.join(__dirname, "reservations.db")
  );

app.get("/api/hotels", (req, res) => {
    const q = req.query.q ? `%${req.query.q}%` : "%";
  
    const sql = `
      SELECT hotel_id, name, description, starRating, city, area, country, url
      FROM Hotel
      WHERE name LIKE ? OR city LIKE ? OR area LIKE ?
    `;
  
    hotelDb.all(sql, [q, q, q], (err, rows) => {
      if (err) {
        console.error("SQL error:", err.message);
        return res.status(500).json({ error: err.message });
      }
  
      res.json(rows);
    });
});

app.get("/api/rooms/:hotelId", (req, res) => {
    const hotelId = req.params.hotelId;

    const sql = `
        SELECT room_id, hotel_id, roomNumber, roomType, status, maxguests, pricePerNight
        FROM Room
        WHERE hotel_id = ?
    `;

    hotelDb.all(sql, [hotelId], (err, rows) => {
        if (err) {
            console.error("Room fetch error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

app.post("/api/reservations", (req, res) => {
    const { room_id, name, phone, check_in, check_out, guestCount } = req.body;
    
    if (!room_id || !name || !phone || !check_in || !check_out || !guestCount) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const roomSql = `
        SELECT room_id, status, maxguests, pricePerNight
        FROM Room
        WHERE room_id = ?
    `;

    hotelDb.get(roomSql, [room_id], (err, room) => {
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

        const overlapSql = `
            SELECT reservation_id
            FROM Reservation
            WHERE room_id = ?
              AND checkInDate < ?
              AND checkOutDate > ?
        `;

        reservationDb.get(overlapSql, [room_id, check_out, check_in], (err, existing) => {
            if (err) {
                console.error("Reservation check error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (existing) {
                return res.status(400).json({ error: "Room is already reserved for those dates" });
            }

            const insertSql = `
                INSERT INTO Reservation
                (room_id, status, checkInDate, checkOutDate, guestCount, name, phone)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            reservationDb.run(
                insertSql,
                [room_id, "occupied", check_in, check_out, guestCount, name, phone],
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});