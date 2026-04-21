const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const reservationDb = new sqlite3.Database(
    path.join(__dirname, "..", "..", "reservations.db")
);

reservationDb.serialize(() => {
    reservationDb.run(`
        CREATE TABLE IF NOT EXISTS Reservation (
            reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            checkInDate TEXT NOT NULL,
            checkOutDate TEXT NOT NULL,
            guestCount INTEGER NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL
        )
    `);

    reservationDb.run(`
        CREATE TABLE IF NOT EXISTS RoomBlock (
            block_id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            reason TEXT
        )
    `);
});

function findOverlappingReservation(roomId, checkIn, checkOut, callback) {
    const sql = `
        SELECT reservation_id, checkInDate, checkOutDate
        FROM Reservation
        WHERE room_id = ?
          AND checkInDate < ?
          AND checkOutDate > ?
    `;

    reservationDb.get(sql, [roomId, checkOut, checkIn], callback);
}

function findBlockedDates(roomId, checkIn, checkOut, callback) {
    const sql = `
        SELECT block_id, startDate, endDate, reason
        FROM RoomBlock
        WHERE room_id = ?
          AND startDate < ?
          AND endDate > ?
    `;

    reservationDb.get(sql, [roomId, checkOut, checkIn], callback);
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

function insertBlock(roomId, startDate, endDate, reason, callback) {
    const sql = `
        INSERT INTO RoomBlock (room_id, startDate, endDate, reason)
        VALUES (?, ?, ?, ?)
    `;

    reservationDb.run(sql, [roomId, startDate, endDate, reason], callback);
}

function getAllBlocks(callback) {
    const sql = `
        SELECT block_id, room_id, startDate, endDate, reason
        FROM RoomBlock
        ORDER BY block_id DESC
    `;

    reservationDb.all(sql, [], callback);
}

function deleteBlockById(blockId, callback) {
    const sql = `
        DELETE FROM RoomBlock
        WHERE block_id = ?
    `;

    reservationDb.run(sql, [blockId], callback);
}

module.exports = {
    findOverlappingReservation,
    findBlockedDates,
    insertReservation,
    getAllReservations,
    insertBlock,
    getAllBlocks,
    deleteBlockById
};