import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import toast from "react-hot-toast";
import "react-calendar/dist/Calendar.css";
import "../styles/book.css";

const API_BASE = "http://localhost:5000";

/* ---------------- SESSION CONFIG (SOURCE OF TRUTH) ---------------- */
const SESSIONS = {
  "Part Day": {
    price: 40000,
    times: ["10:00 AM – 12:00 PM", "1:00 PM – 3:00 PM"]
  },
  "Half Day": {
    price: 80000,
    times: ["7:00 AM – 1:00 PM", "1:00 PM – 6:00 PM"]
  },
  "Full Day": {
    price: 120000,
    times: ["7:00 AM – 6:00 PM"]
  }
};

const Book = () => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(null);
  const [session, setSession] = useState("");
  const [time, setTime] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [takenDates, setTakenDates] = useState([]);
  const [lockedSlots, setLockedSlots] = useState([]);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paid, setPaid] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);

  const amount = session ? SESSIONS[session].price : 0;

  /* ---------------- FETCH TAKEN DATES ---------------- */
  useEffect(() => {
    fetch(`${API_BASE}/api/bookings/taken`)
      .then(res => res.json())
      .then(setTakenDates)
      .catch(err => console.error(err));
  }, []);

  const isTaken = (d) =>
    takenDates.includes(d.toISOString().split("T")[0]);

  /* ---------------- FETCH LOCKED TIME SLOTS ---------------- */
  useEffect(() => {
    if (!date || !session) return;

    fetch(
      `${API_BASE}/api/bookings/slots?date=${date
        .toISOString()
        .split("T")[0]}&session=${session}`
    )
      .then(res => res.json())
      .then(setLockedSlots)
      .catch(err => console.error(err));
  }, [date, session]);

  /* ---------------- HOLD BOOKING ---------------- */
  const holdBooking = async () => {
    if (!customer.name || !customer.email || !customer.phone) {
      toast.error("Please fill in all customer details");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          session,
          timeSlot: time === "custom" ? customTime : time,
          customer,
          amount
        })
      });

      const data = await res.json();
      setCurrentBookingId(data.booking._id);
      toast.success("Booking held for 2 hours");
    } catch (err) {
      console.error(err);
      toast.error("Failed to hold booking");
    }
  };

  /* ---------------- PAYSTACK PAYMENT ---------------- */
  const payAndConfirm = () => {
    if (!currentBookingId) return;

    setLoadingPayment(true);

    const handler = window.PaystackPop.setup({
      key: "YOUR_PAYSTACK_PUBLIC_KEY",
      email: customer.email,
      amount: amount * 100,
      currency: "NGN",
      ref: `${currentBookingId}-${Date.now()}`,
      callback: () => {
        setPaid(true);
        setLoadingPayment(false);
        toast.success("Payment successful! Booking confirmed.");
      },
      onClose: () => {
        setLoadingPayment(false);
        toast.error("Payment cancelled");
      }
    });

    handler.openIframe();
  };

  /* ================= UI ================= */
  return (
    <div className="book-container">

      {/* STEP 1 — DATE */}
      <div className="card">
        <h2>Book Portrait Session</h2>
        <p className="subtitle">Select a date</p>

        <Calendar
          onChange={(d) => {
            setDate(d);
            setStep(2);
          }}
          minDate={today}
          maxDate={maxDate}
          tileDisabled={({ date }) => isTaken(date)}
          tileClassName={({ date }) => (isTaken(date) ? "taken" : null)}
        />
      </div>

      {/* STEP 2 — SESSION */}
      {step >= 2 && date && (
        <div className="card">
          <h3>Choose Session</h3>

          <div className="session-grid">
            {Object.entries(SESSIONS).map(([type, data]) => (
              <div
                key={type}
                className={`session-card ${session === type ? "active" : ""}`}
                onClick={() => {
                  setSession(type);
                  setTime("");
                  setCustomTime("");
                  setStep(3);
                }}
              >
                <h4>{type}</h4>
                <strong>₦{data.price.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — TIME */}
      {step >= 3 && session && (
        <div className="card">
          <h3>Select Time Slot</h3>

          <select value={time} onChange={e => setTime(e.target.value)}>
            <option value="">Choose time</option>
            {SESSIONS[session].times.map(t => (
              <option key={t} disabled={lockedSlots.includes(t)}>
                {t} {lockedSlots.includes(t) && "(Booked)"}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>

          {time === "custom" && (
            <input
              placeholder="Enter custom time"
              value={customTime}
              onChange={e => setCustomTime(e.target.value)}
            />
          )}

          {(time || customTime) && (
            <button className="next-btn" onClick={() => setStep(4)}>
              Next →
            </button>
          )}
        </div>
      )}

      {/* STEP 4 — SUMMARY & PAYMENT */}
      {step === 4 && (
        <div className="card">
          <h3>Booking Summary</h3>

          <div className="summary">
            <p><strong>Date:</strong> {date.toDateString()}</p>
            <p><strong>Session:</strong> {session}</p>
            <p><strong>Time:</strong> {time === "custom" ? customTime : time}</p>
            <p><strong>Total:</strong> ₦{amount.toLocaleString()}</p>
          </div>

          <input
            placeholder="Full Name"
            value={customer.name}
            onChange={e => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            placeholder="Email Address"
            value={customer.email}
            onChange={e => setCustomer({ ...customer, email: e.target.value })}
          />
          <input
            placeholder="Phone Number"
            value={customer.phone}
            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
          />

          {!currentBookingId ? (
            <button className="next-btn" onClick={holdBooking}>
              Hold Booking
            </button>
          ) : (
            <button
              className="primary-btn"
              onClick={payAndConfirm}
              disabled={loadingPayment}
            >
              {loadingPayment ? "Processing..." : "Pay & Confirm"}
            </button>
          )}

          {paid && <p className="success">✅ Booking confirmed!</p>}
        </div>
      )}
    </div>
  );
};

export default Book;