const request = require("supertest");

jest.mock("../src/controllers/hotelController", () => ({
    getHotels: (req, res) => res.status(200).json([{ hotel_id: 1, name: "Mock Hotel" }]),
    getRooms: (req, res) => res.status(200).json([{ room_id: 1, roomNumber: 101 }])
}));

jest.mock("../src/controllers/reservationController", () => ({
    createReservation: (req, res) => res.status(201).json({ success: true, reservation_id: 1 }),
    getReservations: (req, res) => res.status(200).json([{ reservation_id: 1 }])
}));

const app = require("../server");

describe("Server routes", () => {
    test("GET /api/hotels returns hotels", async () => {
        const res = await request(app).get("/api/hotels");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].name).toBe("Mock Hotel");
    });

    test("GET /api/rooms/:hotelId returns rooms", async () => {
        const res = await request(app).get("/api/rooms/1");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].roomNumber).toBe(101);
    });

    test("POST /api/reservations creates reservation", async () => {
        const res = await request(app)
            .post("/api/reservations")
            .send({
                room_id: 1,
                name: "Stefan",
                phone: "1234567",
                check_in: "22-05-26",
                check_out: "25-05-26",
                guestCount: 2
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    test("GET /api/reservations returns reservations", async () => {
        const res = await request(app).get("/api/reservations");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});