const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("frontend"));

const hotelDb = new sqlite3.Database(path.join(__dirname, "Hotel database.db"));

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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});