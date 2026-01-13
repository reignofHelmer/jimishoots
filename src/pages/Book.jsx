import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "../styles/book.css";

const API_BASE = "http://localhost:5000";

/* ---------------- SESSION CONFIG ---------------- */
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

/* ---------------- CUSTOM CALENDAR ---------------- */
const CustomCalendar = ({ selectedDate, onSelect }) => {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const startDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const isDisabled = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    // Only disable past dates, not future dates
    return date < today || date > maxDate;
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )
          }
        >
          ←
        </button>

        <h4>
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric"
          })}
        </h4>

        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )
          }
        >
          →
        </button>
      </div>

      <div className="weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="days-grid">
        {Array.from({ length: startDay }).map((_, i) => (
          <span key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const disabled = isDisabled(day);
          const dateObj = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          );

          return (
            <button
              key={day}
              disabled={disabled}
              className={
                selectedDate &&
                dateObj.toDateString() === selectedDate.toDateString()
                  ? "active"
                  : ""
              }
              onClick={() => {
                onSelect(dateObj);
                toast.success("Date selected: " + dateObj.toDateString());
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ================= BOOK PAGE ================= */
const Book = () => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(null);
  const [session, setSession] = useState("");
  const [time, setTime] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [lockedSlots, setLockedSlots] = useState([]);
  const [paid] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [success, setSuccess] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const amount = session ? SESSIONS[session].price : 0;

    const handlePayNow = () => {
    if (!window.PaystackPop) {
      toast.error("Paystack not loaded");
      return;
    }
  
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: customer.email,
      amount: amount * 100,
      currency: "NGN",
      ref: `JS_${Date.now()}`,
      callback: async (response) => {
        try {
          toast.success("Payment successful. Verifying...");
        
          const res = await fetch(
            `${API_BASE}/api/bookings/confirm/${bookingId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: response.reference }),
            }
          );
        
          const data = await res.json();
        
          if (!res.ok) {
            toast.error(data.message || "Verification failed");
            return;
          }
        
          toast.success("🎉 Booking confirmed!");
          setSuccess(true);
        } catch (err) {
          console.error(err);
          toast.error("Verification error");
        }
      },
      onClose: () => {
        toast.error("Payment cancelled");
      },
    });
  
    handler.openIframe();
  };

  /* FETCH LOCKED SLOTS for selected date */
  useEffect(() => {
    if (!date) return;

    fetch(
      `${API_BASE}/api/bookings/slots?date=${date.toISOString().split("T")[0]}`
    )
      .then(res => res.json())
      .then(slots => {
        // Extract just the time slot strings
        setLockedSlots(slots.map(s => s.timeSlot));
      })
      .catch(console.error);
  }, [date, session]);

  // ✅ Validate custom time
  const validateCustomTime = (timeStr) => {
    if (!timeStr) return true;
    
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/gi;
    const matches = [...timeStr.matchAll(timeRegex)];
    
    if (matches.length === 0) {
      toast.error("Invalid time format. Use format like '2:00 PM - 5:00 PM'");
      return false;
    }

    // Convert to 24-hour
    const convertTo24 = (hour, minute, period) => {
      let h = parseInt(hour);
      if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
      if (period.toUpperCase() === 'AM' && h === 12) h = 0;
      return h + (parseInt(minute) / 60);
    };

    const times = matches.map(m => convertTo24(m[1], m[2], m[3]));
    const start = Math.min(...times);
    const end = Math.max(...times);

    if (start < 7) {
      toast.error("Bookings cannot start before 7:00 AM");
      return false;
    }
    
    if (end > 21) {
      toast.error("Bookings cannot end after 9:00 PM");
      return false;
    }

    return true;
  };

  return (
    <div className="book-container">
      {/* BACKGROUND VIDEO */}
      <video
        className="booking-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/booking-bg.mp4" type="video/mp4" />
      </video>

      <div className="video-overlay" />

      {/* STEP 1 — DATE */}
      <div className="card">
        <h2>Book Portrait Session</h2>
        <p className="subtitle">Select a date (multiple bookings per day allowed)</p>

        <CustomCalendar
          selectedDate={date}
          onSelect={(d) => {
            setDate(d);
            setStep(2);
          }}
        />
      </div>

      {/* STEP 2 — SESSION */}
      {step >= 2 && (
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
                  toast.success("Session selected: " + type);
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
      {step >= 3 && (
        <div className="card">
          <h3>Select Time Slot</h3>
          <p className="time-note">⏰ Available hours: 7:00 AM - 9:00 PM</p>

          {lockedSlots.length > 0 && (
            <div className="locked-info">
              <p>⚠️ Already booked for {date.toDateString()}:</p>
              <ul>
                {lockedSlots.map((slot, i) => (
                  <li key={i}>{slot}</li>
                ))}
              </ul>
            </div>
          )}

          <select value={time} onChange={e => setTime(e.target.value)}>
            <option value="">Choose time</option>
            {SESSIONS[session].times.map(t => (
              <option key={t} value={t} disabled={lockedSlots.includes(t)}>
                {t} {lockedSlots.includes(t) && "❌ (Booked)"}
              </option>
            ))}
            <option className="custom" value="custom">✏️ Custom Time</option>
          </select>

          {time === "custom" && (
            <>
              <input
                placeholder="e.g., 2:00 PM - 5:00 PM"
                value={customTime}
                onChange={e => setCustomTime(e.target.value)}
              />
              <small style={{ color: '#999', marginTop: '8px', display: 'block' }}>
                Format: "HH:MM AM/PM - HH:MM AM/PM" (between 7:00 AM and 9:00 PM)
              </small>
            </>
          )}

          {(time || customTime) && (
            <button
              className="next-btn"
              onClick={() => {
                if (time === "custom" && !validateCustomTime(customTime)) {
                  return;
                }
                setStep(4);
                toast.success("Time slot selected");
              }}
            >
              Continue
            </button>
          )}
        </div>
      )}

      {/* STEP 4 — SUMMARY */}
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

          <button
            className="primary-btn"
            disabled={loadingPayment}
            onClick={async () => {
              if (!customer.name || !customer.email || !customer.phone) {
                toast.error("Please fill in all details");
                return;
              }

              try {
                setLoadingPayment(true);

                const res = await fetch(`${API_BASE}/api/bookings/hold`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    date: date.toISOString().split("T")[0],
                    bookingType: session,
                    timeSlot: time === "custom" ? null : time,
                    customTime: time === "custom" ? customTime : null,
                    amount,
                    customer
                  })
                });

                const data = await res.json();

                if (!res.ok) {
                  toast.error(data.message || "Booking failed");
                  setLoadingPayment(false);
                  return;
                }

                setBookingId(data.booking._id);
                toast.success("Time slot reserved! Opening payment...");

                handlePayNow();

              } catch (err) {
                console.error(err);
                toast.error("Something went wrong");
              } finally {
                setLoadingPayment(false);
              }
            }}
          >
            {loadingPayment ? "Processing..." : "Pay & Confirm"}
          </button>

          {paid && <p className="success">✅ Booking confirmed!</p>}
          {success && (
            <div className="success-card">
              <h3>🎉 Booking Confirmed</h3>
              <p>We've sent a receipt to {customer.email}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Book;