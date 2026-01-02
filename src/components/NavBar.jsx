import { Camera } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="logo">
        <Camera size={24} className="logo-icon" />
        JIMISHOOTS
      </Link>

      {/* NAV LINKS */}
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/portfolio">Portfolio</Link></li>
        <li><Link to="/book">Book</Link></li>
      </ul>

      {/* CTA */}
      <Link to="/book" className="nav-cta">
        Book a Session →
      </Link>
    </nav>
  );
};

export default Navbar;