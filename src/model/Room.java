public class Room {
    private int roomNumber;
    private String roomType;
    private String status;
    private int maxGuests;
    private double pricePerNight;

    public Room(int roomNumber, String roomType, String status, int maxGuests, double pricePerNight) {
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.status = status;
        this.maxGuests = maxGuests;
        this.pricePerNight = pricePerNight;
    }

    public int getRoomNumber() { return roomNumber; }
    public String getRoomType() { return roomType; }
    public String getStatus() { return status; }
    public int getMaxGuests() { return maxGuests; }
    public double getPricePerNight() { return pricePerNight; }
}