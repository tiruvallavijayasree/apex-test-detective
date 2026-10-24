public class PaymentChecker {
    public static Boolean isPaymentHigh(Decimal amount){
        return amount > 3000;
    }
}