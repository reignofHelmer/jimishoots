import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/book.css";

const Book = () => {
  const [date, setDate] = useState(null);
  const [bookingType, setBookingType] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [takenDates, setTakenDates] = useState([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);

  const API_BASE = "http://localhost:5000";

  // Fetch taken dates
  const fetchTakenDates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/taken`);
      if (!res.ok) {
        const text = await res.text();
        console.error("Error fetching taken dates:", text);
        return;
      }
      const dates = await res.json();
      setTakenDates(dates);
    } catch (err) {
      console.error("Network error fetching taken dates:", err);
    }
  };

  useEffect(() => {
    fetchTakenDates();
  }, []);

  const isTaken = (date) =>
    takenDates.includes(date.toISOString().split("T")[0]);

  const resetTimeSelection = () => {
    setTimeSlot("");
    setCustomTime("");
  };

  const HOLD_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  // Dynamic pricing in Naira
  const getAmount = () => {
    switch (bookingType) {
      case "part":
        return 5000; // ₦5,000
      case "half":
        return 8000; // ₦8,000
      case "full":
        return 12000; // ₦12,000
      default:
        return 5000;
    }
  };

  // Hold booking
  const holdBooking = async () => {
    if (!date || !bookingType || !timeSlot) {
      alert("Please select date, booking type, and time before holding.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString(),
          bookingType,
          timeSlot,
          customTime,
          amount: getAmount(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error holding booking:", text);
        throw new Error("Booking hold failed");
      }

      const data = await res.json();
      setCurrentBookingId(data.booking._id);
      setHoldExpiresAt(data.booking.expiresAt);

      fetchTakenDates();
      alert("Booking held for 2 hours!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Confirm booking
  const confirmBooking = async (paystackReference = null) => {
    if (!currentBookingId) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/bookings/confirm/${currentBookingId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: paystackReference }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Error confirming booking:", text);
        throw new Error("Booking confirmation failed");
      }

      const data = await res.json();
      console.log("Booking confirmed:", data);

      setCurrentBookingId(null);
      setHoldExpiresAt(null);
      setTimeLeft(null);
      setPaid(true);
      alert("✅ Booking confirmed & paid successfully!");
      fetchTakenDates();
    } catch (err) {
      console.error(err);
      alert("❌ Payment verification failed: " + err.message);
      setPaid(false);
    } finally {
      setLoadingPayment(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = holdExpiresAt - Date.now();

      if (remaining <= 0) {
        clearInterval(interval);
        setHoldExpiresAt(null);
        setTimeLeft(null);
        setCurrentBookingId(null);
        setPaid(false);
        alert("Booking hold expired. Please book again.");
        fetchTakenDates();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  // Paystack payment with dynamic Naira amount
  const payAndConfirm = () => {
    if (!currentBookingId) return;

    setLoadingPayment(true);

    const handler =
      window.PaystackPop &&
      window.PaystackPop.setup({
        key: "YOUR_PAYSTACK_PUBLIC_KEY",
        email: "customer@example.com",
        amount: getAmount() * 100, // convert ₦ to kobo
        currency: "NGN",
        ref: `${currentBookingId}-${Date.now()}`,
        callback: async (response) => {
          console.log("Paystack response:", response);
          alert("Payment successful! Confirming booking...");
          await confirmBooking(response.reference);
        },
        onClose: () => {
          alert("Payment cancelled");
          setLoadingPayment(false);
        },
      });

    handler && handler.openIframe();
  };

  const renderTimeOptions = () => {
    if (bookingType === "part") {
      return (
        <>
          <option value="">Select time</option>
          <option>10–12</option>
          <option>1–3</option>
          <option>4–6</option>
          <option value="custom">Custom time</option>
        </>
      );
    }
    if (bookingType === "half") {
      return (
        <>
          <option value="">Select time</option>
          <option>7–12</option>
          <option>1–6</option>
          <option value="custom">Custom time</option>
        </>
      );
    }
    if (bookingType === "full") {
      return (
        <>
          <option value="">Select start time</option>
          <option>6:00 AM</option>
          <option>7:00 AM</option>
          <option>8:00 AM</option>
          <option value="custom">Custom start time</option>
        </>
      );
    }
    return null;
  };

  return (
    <div className="book-page">
      <h1>Book a Session</h1>
      <p>Select a date to get started</p>

      <div className="calendar-wrapper">
        <Calendar
          onChange={(value) => {
            setDate(value);
            setBookingType("");
            resetTimeSelection();
          }}
          value={date}
          minDate={today}
          maxDate={maxDate}
          tileDisabled={({ date }) => isTaken(date)}
          tileClassName={({ date }) => (isTaken(date) ? "taken" : null)}
        />
      </div>

      {date && (
        <>
          <div className="selected-date">
            Selected Date: <strong>{date.toDateString()}</strong>
          </div>

          <div className="booking-type">
            <h3>Choose booking type</h3>
            {["part", "half", "full"].map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="booking"
                  value={type}
                  onChange={(e) => {
                    setBookingType(e.target.value);
                    resetTimeSelection();
                  }}
                />
                {type === "part"
                  ? "Part-day"
                  : type === "half"
                  ? "Half-day"
                  : "Full-day"}
              </label>
            ))}
          </div>
        </>
      )}

      {bookingType && (
        <div className="time-selection">
          <h3>Select time</h3>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            {renderTimeOptions()}
          </select>
          {timeSlot === "custom" && (
            <input
              type="text"
              placeholder="Enter preferred time (e.g. 9:30 AM – 1 PM)"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
          )}
        </div>
      )}

      {timeSlot && !currentBookingId && (
        <div className="booking-footer">
          <button className="cta" onClick={holdBooking}>
            Hold Booking
          </button>
        </div>
      )}

      {currentBookingId && !paid && (
        <div className="booking-footer">
          <button className="cta" onClick={payAndConfirm} disabled={loadingPayment}>
            {loadingPayment ? "Processing Payment..." : "Pay & Confirm Booking (₦" + getAmount() + ")"}
          </button>
          {timeLeft && (
            <p className="hold-timer">
              ⏳ Time remaining:{" "}
              <strong>
                {Math.floor(timeLeft / 60000)}:
                {String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0")}
              </strong>
            </p>
          )}
          <p className="hold-note">
            This booking is held for <strong>2 hours</strong> until payment & confirmation.
          </p>
        </div>
      )}

      {paid && (
        <div className="booking-footer">
          <p>✅ Booking confirmed & paid!</p>
        </div>
      )}
    </div>
  );
};

export default Book;