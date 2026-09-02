function Contact() {
  return (
    <div className="contact-page">

      {/* Heading */}
      <h1 className="contact-heading">
        Contact Us ☎
      </h1>

      {/* Main Contact Section */}
      <div className="contact-container">

        {/* Left Side */}
        <div className="contact-info">

          <p className="small-title">KEEP CLOSE</p>

          <h2>Get In Touch</h2>

          <p className="contact-para">
            We'd love to hear from you. Visit our cafe or send us your
            questions anytime.
          </p>

          <div className="info-box">
            <p>📍 Lahore, Pakistan</p>
            <p>📞 +92 300 XXXXXXX</p>
          </div>

          <div className="info-box">
            <p>📧 brewhaven@gmail.com</p>
            <p>⏰ Open 8AM - 11PM</p>
          </div>

        </div>

        {/* Right Side */}
        <div className="contact-form">

          <h2>Your Details</h2>

          <form>

            <div className="input-row">

              <input
                type="text"
                placeholder="Your Name"
              />

              <input
                type="email"
                placeholder="Email Address"
              />

            </div>

            <input
              type="text"
              placeholder="Subject"
            />

            <textarea
              placeholder="Your Message"
            ></textarea>

            <button type="submit">
              CONTACT US
            </button>

          </form>

        </div>

      </div>

      {/* Google Map */}
      <div className="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d871887.8993453102!2d74.2555648!3d31.391744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1787112244258!5m2!1sen!2s"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Brew Haven Location"
        />
      </div>

    </div>
  );
}

export default Contact;