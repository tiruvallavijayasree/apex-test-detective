@IsTest
private class PaymentCheckerTest {
    @IsTest
    static void testHighPayment() {
        System.assertEquals(
            true,
            PaymentChecker.isPaymentHigh(4000),
            'A payment above 3000 should be high'
        );
    }

    @IsTest
    static void testPaymentAtThreshold() {
        System.assertEquals(
            false,
            PaymentChecker.isPaymentHigh(3000),
            'A payment equal to 3000 should not be high'
        );
    }

    @IsTest
    static void testLowPayment() {
        System.assertEquals(
            false,
            PaymentChecker.isPaymentHigh(1000),
            'A payment below 3000 should not be high'
        );
    }

    @IsTest
    static void testIntentionalAssertionFailure() {
        System.assertEquals(
            true,
            PaymentChecker.isPaymentHigh(1000),
            'DEMO_FAILURE: Expected payment to be high, but 1000 is below 3000.'
        );
    }
}
