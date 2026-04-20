const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const hotelDb = new sqlite3.Database(
    path.join(__dirname, "Hotel database.db")
);

function searchHotels(query, callback) {
    const q = query ? `%${query}%` : "%";

    const sql = `
        SELECT hotel_id, name, description, starRating, city, area, country, url
        FROM Hotel
        WHERE name LIKE ? OR city LIKE ? OR area LIKE ?
    `;

    hotelDb.all(sql, [q, q, q], callback);
}

function getRoomsByHotelId(hotelId, callback) {
    const sql = `
        SELECT room_id, hotel_id, roomNumber, roomType, status, maxguests, pricePerNight
        FROM Room
        WHERE hotel_id = ?
    `;

    hotelDb.all(sql, [hotelId], callback);
}

function getRoomById(roomId, callback) {
    const sql = `
        SELECT room_id, status, maxguests, pricePerNight
        FROM Room
        WHERE room_id = ?
    `;

    hotelDb.get(sql, [roomId], callback);
}

module.exports = {
    searchHotels,
    getRoomsByHotelId,
    getRoomById
};