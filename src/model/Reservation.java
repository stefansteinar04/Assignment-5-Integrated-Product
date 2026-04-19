public class Reservation {
    private String status;
    private String checkInDate;
    private String checkOutDate;
    private int guestCount;
    private double totalPrice;
    private String name;
    private String phone;

    public Reservation(String status, String checkInDate, String checkOutDate,
                       int guestCount, double totalPrice, String name, String phone) {
        this.status = status;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.guestCount = guestCount;
        this.totalPrice = totalPrice;
        this.name = name;
        this.phone = phone;
    }

    public String getStatus() { return status; }
    public String getCheckInDate() { return checkInDate; }
    public String getCheckOutDate() { return checkOutDate; }
    public int getGuestCount() { return guestCount; }
    public double getTotalPrice() { return totalPrice; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    
    public double calculateTotalPrice() {
        return totalPrice;
    }
}