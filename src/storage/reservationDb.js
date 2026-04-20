const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const reservationDb = new sqlite3.Database(
    path.join(__dirname, "..", "..", "reservations.db")
);

function parseCustomDate(dateStr) {
    const [day, month, year] = dateStr.split("-").map(Number);
    const fullYear = 2000 + year;
    return new Date(fullYear, month - 1, day);
}

function findOverlappingReservation(roomId, checkIn, checkOut, callback) {
    const sql = `
        SELECT reservation_id, checkInDate, checkOutDate
        FROM Reservation
        WHERE room_id = ?
    `;

    reservationDb.all(sql, [roomId], (err, rows) => {
        if (err) {
            return callback(err);
        }

        const newCheckIn = parseCustomDate(checkIn);
        const newCheckOut = parseCustomDate(checkOut);

        const overlap = rows.find(r => {
            const existingCheckIn = parseCustomDate(r.checkInDate);
            const existingCheckOut = parseCustomDate(r.checkOutDate);

            return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
        });

        callback(null, overlap || null);
    });
}

function insertReservation(roomId, checkIn, checkOut, guestCount, name, phone, callback) {
    const sql = `
        INSERT INTO Reservation
        (room_id, status, checkInDate, checkOutDate, guestCount, name, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    reservationDb.run(
        sql,
        [roomId, "occupied", checkIn, checkOut, guestCount, name, phone],
        callback
    );
}

function getAllReservations(callback) {
    const sql = `
        SELECT reservation_id, room_id, status, checkInDate, checkOutDate, guestCount, name, phone
        FROM Reservation
        ORDER BY reservation_id DESC
    `;

    reservationDb.all(sql, [], callback);
}

module.exports = {
    findOverlappingReservation,
    insertReservation,
    getAllReservations
};