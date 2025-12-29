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

  /* ---------------- FETCH TAKEN DATES ---------------- */
  const fetchTakenDates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/taken`);
      const dates = await res.json();
      setTakenDates(dates);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffect(() => {
  //   fetchTakenDates();
  // }, []);

  const isTaken = (date) =>
    takenDates.includes(date.toISOString().split("T")[0]);

  const resetTimeSelection = () => {
    setTimeSlot("");
    setCustomTime("");
  };

  /* ---------------- PRICING ---------------- */
  const getAmount = () => {
    switch (bookingType) {
      case "part":
        return 40000;
      case "half":
        return 80000;
      case "full":
        return 120000;
      default:
        return 0;
    }
  };

  /* ---------------- HOLD BOOKING ---------------- */
  const holdBooking = async () => {
    if (!date || !bookingType || !timeSlot) {
      alert("Please complete all selections.");
      return;
    }

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

    const data = await res.json();
    setCurrentBookingId(data.booking._id);
    setHoldExpiresAt(data.booking.expiresAt);
    fetchTakenDates();
  };

  /* ---------------- CONFIRM BOOKING ---------------- */
  const confirmBooking = async (reference) => {
    const res = await fetch(
      `${API_BASE}/api/bookings/confirm/${currentBookingId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      }
    );

    await res.json();
    setPaid(true);
    setCurrentBookingId(null);
    setHoldExpiresAt(null);
    setTimeLeft(null);
    fetchTakenDates();
  };

  /* ---------------- COUNTDOWN ---------------- */
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = holdExpiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setHoldExpiresAt(null);
        setCurrentBookingId(null);
        setPaid(false);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  /* ---------------- PAYSTACK ---------------- */
  const payAndConfirm = () => {
    setLoadingPayment(true);

    const handler =
      window.PaystackPop &&
      window.PaystackPop.setup({
        key: "YOUR_PAYSTACK_PUBLIC_KEY",
        email: "customer@example.com",
        amount: getAmount() * 100,
        currency: "NGN",
        ref: `${currentBookingId}-${Date.now()}`,
        callback: (response) => {
          confirmBooking(response.reference);
          setLoadingPayment(false);
        },
        onClose: () => setLoadingPayment(false),
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
          <option value="custom">Custom</option>
        </>
      );
    }
    if (bookingType === "half") {
      return (
        <>
          <option value="">Select time</option>
          <option>7–12</option>
          <option>1–6</option>
          <option value="custom">Custom</option>
        </>
      );
    }
    if (bookingType === "full") {
      return (
        <>
          <option value="">Start time</option>
          <option>6:00 AM</option>
          <option>7:00 AM</option>
          <option>8:00 AM</option>
          <option value="custom">Custom</option>
        </>
      );
    }
  };

  return (
    <div className="book-page">
      <header className="book-header">
        <h1>Book a Session</h1>
        <p>Choose your preferred date and session type</p>
      </header>

      <section className="book-calendar">
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
      </section>

      {date && (
        <section className="book-type">
          <h2>Select Session</h2>
          <div className="session-grid">
            {[
              { id: "part", label: "Part Day", price: "₦40,000" },
              { id: "half", label: "Half Day", price: "₦80,000" },
              { id: "full", label: "Full Day", price: "₦120,000" },
            ].map((s) => (
              <div
                key={s.id}
                className={`session-card ${
                  bookingType === s.id ? "active" : ""
                }`}
                onClick={() => {
                  setBookingType(s.id);
                  resetTimeSelection();
                }}
              >
                <h3>{s.label}</h3>
                <span>{s.price}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {bookingType && (
        <section className="book-time">
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            {renderTimeOptions()}
          </select>

          {timeSlot === "custom" && (
            <input
              placeholder="Enter preferred time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
          )}
        </section>
      )}

      <aside className="book-summary">
        <h3>Summary</h3>
        <p>{date ? date.toDateString() : "No date selected"}</p>
        <p>{bookingType || "No session selected"}</p>
        <p>{timeSlot || "No time selected"}</p>
        <strong>₦{getAmount().toLocaleString()}</strong>
      </aside>

      <footer className="book-actions">
        {!currentBookingId && timeSlot && (
          <button className="cta" onClick={holdBooking}>
            Hold Booking
          </button>
        )}

        {currentBookingId && !paid && (
          <>
            <button className="cta" onClick={payAndConfirm}>
              {loadingPayment ? "Processing..." : "Pay & Confirm"}
            </button>
            {timeLeft && (
              <p className="timer">
                ⏳ {Math.floor(timeLeft / 60000)}:
                {String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0")}
              </p>
            )}
          </>
        )}

        {paid && <p className="success">Booking confirmed 🎉</p>}
      </footer>
    </div>
  );
};

export default Book;