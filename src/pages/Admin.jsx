import { useEffect, useState } from "react";
import "../styles/admin.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Admin = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/bookings`)
      .then(res => res.json())
      .then(setBookings)
      .catch(console.error);
  }, []);

  return (
    <div className="admin-page">
      <h1>Bookings Dashboard</h1>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Session</th>
            <th>Time</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map(b => (
            <tr key={b._id}>
              <td>{new Date(b.date).toDateString()}</td>
              <td>{b.bookingType}</td>
              <td>{b.timeSlot || b.customTime}</td>
              <td>
                <strong>{b.customer?.name}</strong><br />
                {b.customer?.email}
              </td>
              <td className={b.status}>{b.status}</td>
              <td>₦{b.amount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;