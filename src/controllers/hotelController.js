const hotelDb = require("../storage/hotelDb");

function getHotels(req, res) {
    const query = req.query.q || "";

    hotelDb.searchHotels(query, (err, rows) => {
        if (err) {
            console.error("SQL error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
}

function getRooms(req, res) {
    const hotelId = req.params.hotelId;

    hotelDb.getRoomsByHotelId(hotelId, (err, rows) => {
        if (err) {
            console.error("Room fetch error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
}

module.exports = {
    getHotels,
    getRooms
};