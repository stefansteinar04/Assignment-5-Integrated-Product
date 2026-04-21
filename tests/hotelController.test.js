const hotelController = require("../src/controllers/hotelController");

jest.mock("../src/storage/hotelDb");

const hotelDb = require("../src/storage/hotelDb");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("hotelController", () => {

    test("getHotels returns data", () => {
        const req = { query: { q: "hotel" } };
        const res = mockRes();

        hotelDb.searchHotels.mockImplementation((q, cb) =>
            cb(null, [{ hotel_id: 1 }])
        );

        hotelController.getHotels(req, res);

        expect(res.json).toHaveBeenCalledWith([{ hotel_id: 1 }]);
    });

    test("getRooms returns data", () => {
        const req = { params: { hotelId: 1 } };
        const res = mockRes();

        hotelDb.getRoomsByHotelId.mockImplementation((id, cb) =>
            cb(null, [{ room_id: 1 }])
        );

        hotelController.getRooms(req, res);

        expect(res.json).toHaveBeenCalledWith([{ room_id: 1 }]);
    });

});