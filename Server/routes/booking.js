const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');  // calling middlware
const { bookEvent, sendBookingOtp, getMyBookings, confirmBooking, cancelBooking } = require('../controllers/bookingController');

// 1)Book an event
router.post('/', protect, bookEvent);
// 2)Send Booking OTP
router.post('/send-otp', protect, sendBookingOtp);
// 3)Get my bookings
router.get('/my-bookings', protect, getMyBookings);
// 4)Confirm a booking (Admin only)
router.put('/:id/confirm', protect, admin, confirmBooking);
// 5)Cancel Booking
router.delete('/:id', protect, cancelBooking);

module.exports = router;