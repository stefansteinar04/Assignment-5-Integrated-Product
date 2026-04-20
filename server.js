const express = require("express");
const hotelController = require("./src/controllers/hotelController");
const reservationController = require("./src/controllers/reservationController");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("frontend"));

app.get("/api/hotels", hotelController.getHotels);
app.get("/api/rooms/:hotelId", hotelController.getRooms);
app.post("/api/reservations", reservationController.createReservation);
app.get("/api/reservations", reservationController.getReservations);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});