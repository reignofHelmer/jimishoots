import React from "react";
import "../styles/whatsapp.css"; // We'll add some styling

const WhatsAppButton = () => {
  const phoneNumber = "2349035906395"; // replace with your WhatsApp number
  const message = "Hello Jimishoots, I’d like to make an enquiry";

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
    >
      <img src="/whatsapp-icon.png" alt="WhatsApp" />
    </a>
  );
};

export default WhatsAppButton;