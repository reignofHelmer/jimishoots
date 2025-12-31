import { Instagram, Twitter, Linkedin } from "lucide-react";
import "../styles/home.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


const Home = () => {
  const navigate = useNavigate();
                useEffect(() => {
                const observer = new IntersectionObserver(
                  (entries) => {
                    entries.forEach((entry) => {
                      if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                      }
                    });
                  },
                  { threshold: 0.2 }
                );
              
                document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
              
                return () => observer.disconnect();
              }, []);

  return (
    <>
    <section className="hero fade-in">
      <h1>Photography <br /> That Feels <br /> <i>Like You</i></h1>
      <p>Portraits, weddings and commercial sessions <br /> curated, effortless, and made to last.</p>
      <button className="cta" onClick={() => navigate("/book")}>Book a Session</button>
      <button className="cta" onClick={() => navigate("/portfolio")}>View Portfolio</button>
    </section>

    <section className="bio-section fade-in">
      <div className="bio-content">
        <h2>Passionate About Capturing Life's Most Significant Moments.</h2>
        <p>
          I'm Folajimi, capturing moments with artistry and precision. 
          My journey into photography began with a fascination for visual storytelling, 
          and over the years, I've developed a unique style that blends artistic creativity 
          with technical precision.
        </p>

        <p>
          I strive to highlight the true essence of my subjects, 
          bringing out their natural beauty and character. 
          With a commitment to excellence, I ensure that each photograph tells a story.
        </p>

        <button className="cta" >Contact Us</button>
      </div>

      <div className="bio-card fade-in">
        <img
          src="public/images/download.jpg"
          alt="Portrait of the photographer"
        />
      </div>
    </section>

    <section className="services-section">
        <div className="services-header">
          <span className="services-label">SERVICES</span>
          <h2>What I Offer</h2>
          <p>
            Sessions are relaxed, well-planned and guided from wardrobe to final
            delivery. Choose the package that fits your needs.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <img src="/images/portrait.png" alt="Portrait sessions" />
            <h3>Portrait Sessions</h3>
            <p>
              Headshots & personal portraits that capture your authentic self.
            </p>
            <div className="service-footer">
              <span>FROM ₦75,000</span>
              <a href="#">Learn More →</a>
            </div>
          </div>

          <div className="service-card">
            <img src="/public/images/wedding.png" alt="Wedding photography" />
            <h3>Weddings & Events</h3>
            <p>
              Full-day & micro weddings — every precious moment preserved.
            </p>
            <div className="service-footer">
              <span>FROM ₦350,000</span>
              <a href="#">Learn More →</a>
            </div>
          </div>

          <div className="service-card">
            <img src="/public/images/commercial.png" alt="Commercial photography" />
            <h3>Commercial & Product</h3>
            <p>
              Brand photography for web, socials, and print campaigns.
            </p>
            <div className="service-footer">
              <span>FROM ₦150,000</span>
              <a href="#">Learn More →</a>
            </div>
          </div>
        </div>
      </section>

    <section className="steps-section">
      <div className="steps-content">
        <p>How it Works.</p>
        <h2>BOOKING MADE SIMPLE</h2>
        <p>
          Fast booking — choose service, pick a date, confirm. 
          Need help? Contact us — we'll handle the rest.
        </p>
        <button className="cta" onClick={() => navigate("/book")}>Start Booking</button>
      </div>

      <div className="steps-card">
      <h2>
        <ol>
          <li>Choose your service</li>
          <p>Select your session type, browse available dates, 
            and secure your spot with a simple booking.</p>
          <li>Pick a date</li>
          <p>Review your session details, receive a pre-session guide, 
            and complete secure payment.</p>
          <li>Confirm booking</li>
          <p>Enjoy a relaxed, guided session. 
            Your curated gallery delivered in 5–7 business days.</p>
        </ol>
      </h2>
      </div>
    </section>

    <section className="testimonials-section">
      <span className="section-label">TESTIMONIALS</span>
      <h2>CLIENT REVIEWS</h2>
      <div className="testimonials-grid">
        {[
          {
            name: "Michael Okonkwo",
            role: "Corporate Client",
            text:
              "The most professional and relaxed photoshoot I’ve ever experienced. Highly recommend!",
          },
          {
            name: "Adaeze Nwoye",
            role: "Wedding Client",
            text:
              "From start to finish, the experience was calm and seamless. The photos exceeded our expectations.",
          },
          {
            name: "Tunde Adebayo",
            role: "Brand Consultant",
            text:
              "Exceptional attention to detail and creative direction. I’ll definitely be booking again.",
          },
        ].map((testimonial, index) => (
          <div className="testimonial-card" key={index}>
            <div className="stars">★★★★★</div>
        
            <p className="testimonial-text">
              “{testimonial.text}”
            </p>
        
            <div className="testimonial-author">
              <strong>{testimonial.name}</strong>
              <span>{testimonial.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

<section className="cta-footer">
  {/* CTA */}
  <div className="cta-book fade-in">
    <h2>Ready to Book?</h2>
    <p>
      Let’s create something beautiful together. Book your session today and
      receive your curated gallery in just 5–7 days.
    </p>
    <button className="cta primary" onClick={() => navigate("/book")}>
      Book Now →
    </button>
  </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Folajimi</h3>
            <p>
              Capturing authentic moments with artistry and precision. Portraits,
              weddings, and commercial photography — curated, effortless, and made
              to last.
            </p>

            <div className="socials">
              <a href="#"><Instagram size={18} /></a>
              <a href="#"><Twitter size={18} /></a>
              <a href="#"><Linkedin size={18} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/portfolio">Portfolio</a>
            <a href="/book">Book a Session</a>
          </div>

          <div className="footer-contact">
            <h4>Folajimi</h4>
            <p>hello@jimichu.com</p>
            <p>+234 XXX XXX XXXX</p>
            <p>Abuja, Nigeria</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Folajimi Photography. All rights reserved.</p>
          <div className="legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </section>

  </>
  );
};

export default Home;