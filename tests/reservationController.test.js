const reservationController = require("../src/controllers/reservationController");

jest.mock("../src/storage/hotelDb");
jest.mock("../src/storage/reservationDb");

const hotelDb = require("../src/storage/hotelDb");
const reservationDb = require("../src/storage/reservationDb");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("createReservation", () => {

    test("returns 400 if fields missing", () => {
        const req = { body: {} };
        const res = mockRes();

        reservationController.createReservation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
    });

    test("returns 400 if room not found", () => {
        const req = {
            body: {
                room_id: 1,
                name: "Stefan",
                phone: "123",
                check_in: "01",
                check_out: "02",
                guestCount: 1
            }
        };
        const res = mockRes();

        hotelDb.getRoomById.mockImplementation((id, cb) => cb(null, null));

        reservationController.createReservation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Room not found" });
    });

    test("rejects unavailable room", () => {
        const req = {
            body: {
                room_id: 1,
                name: "Stefan",
                phone: "123",
                check_in: "01",
                check_out: "02",
                guestCount: 1
            }
        };
        const res = mockRes();

        hotelDb.getRoomById.mockImplementation((id, cb) =>
            cb(null, { status: "occupied", maxguests: 2 })
        );

        reservationController.createReservation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("rejects too many guests", () => {
        const req = {
            body: {
                room_id: 1,
                name: "Stefan",
                phone: "123",
                check_in: "01",
                check_out: "02",
                guestCount: 5
            }
        };
        const res = mockRes();

        hotelDb.getRoomById.mockImplementation((id, cb) =>
            cb(null, { status: "available", maxguests: 2 })
        );

        reservationController.createReservation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("rejects overlapping reservation", () => {
        const req = {
            body: {
                room_id: 1,
                name: "Stefan",
                phone: "123",
                check_in: "01",
                check_out: "02",
                guestCount: 1
            }
        };
        const res = mockRes();

        hotelDb.getRoomById.mockImplementation((id, cb) =>
            cb(null, { status: "available", maxguests: 2 })
        );

        reservationDb.findOverlappingReservation.mockImplementation((id, ci, co, cb) =>
            cb(null, { reservation_id: 1 })
        );

        reservationController.createReservation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("creates reservation successfully", () => {
        const req = {
            body: {
                room_id: 1,
                name: "Stefan",
                phone: "123",
                check_in: "01",
                check_out: "02",
                guestCount: 1
            }
        };
        const res = mockRes();

        hotelDb.getRoomById.mockImplementation((id, cb) =>
            cb(null, { status: "available", maxguests: 2, pricePerNight: 10000 })
        );

        reservationDb.findOverlappingReservation.mockImplementation((id, ci, co, cb) =>
            cb(null, null)
        );

        reservationDb.insertReservation.mockImplementation(function (...args) {
            const cb = args[args.length - 1];
            cb.call({ lastID: 99 }, null);
        });

        reservationController.createReservation(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                reservation_id: 99
            })
        );
    });
});