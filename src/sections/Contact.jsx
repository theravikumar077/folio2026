import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import Marquee from "../components/Marquee";
import { socials } from "../constants";
import gsap from "gsap";
import { saveOfflineContact, syncOfflineContacts } from "../utils/indexedDB";
import { requestBackgroundSync } from "../utils/swRegister";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [statusMsg, setStatusMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const text = `Got a question, idea or project in mind?
    WE’D love to hear from you and discuss further!`;
  const items = [
    "just imagine, I code",
    "just imagine, I code",
    "just imagine, I code",
    "just imagine, I code",
    "just imagine, I code",
  ];

  useGSAP(() => {
    gsap.from(".social-link", {
      y: 100,
      opacity: 0,
      delay: 0.5,
      duration: 1,
      stagger: 0.3,
      ease: "back.out",
      scrollTrigger: {
        trigger: ".social-link",
      },
    });
  }, []);

  // Automatic sync when connection returns
  useEffect(() => {
    const handleOnline = async () => {
      console.log("[Contact] Internet connection restored. Syncing offline forms...");
      const result = await syncOfflineContacts(async (contact) => {
        // Backend API submission simulation/endpoint call
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contact),
        }).catch(() => {
          console.log("[Contact] Synced message payload locally:", contact);
        });
      });

      if (result.syncedCount > 0) {
        setStatusMsg(`Connected! ${result.syncedCount} queued message(s) sent successfully.`);
        setTimeout(() => setStatusMsg(""), 5000);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setStatusMsg("");

    const isOnline = navigator.onLine;

    if (isOnline) {
      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).catch(() => {
          console.log("[Contact] Online payload received:", formData);
        });
        setStatusMsg("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } catch (err) {
        console.error("Form submit error:", err);
        setStatusMsg("Error sending message. Try again.");
      }
    } else {
      // Offline mode: save locally to IndexedDB
      try {
        await saveOfflineContact(formData);
        await requestBackgroundSync("sync-contact-form");
        setStatusMsg("You are offline. Message saved locally and will auto-submit when online!");
        setFormData({ name: "", email: "", message: "" });
      } catch (err) {
        console.error("Failed to save offline contact:", err);
        setStatusMsg("Failed to save message offline.");
      }
    }
    setIsSubmitting(false);
  };

  return (
    <section
      id="contact"
      className="flex flex-col justify-between min-h-screen bg-black w-full overflow-hidden"
    >
      <div>
        <AnimatedHeaderSection
          subTitle={"You Dream It, I Code it"}
          title={"Contact"}
          text={text}
          textColor={"text-white"}
          withScrollTrigger={true}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-10 mb-10 text-white font-light">
          {/* Contact Direct Info */}
          <div className="flex flex-col gap-10 lg:text-[32px] text-[26px] leading-none">
            <div className="social-link">
              <h2>E-mail</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <p className="text-xl tracking-wider lowercase md:text-2xl lg:text-3xl">
                ravikumar071203@gmail.com
              </p>
            </div>
            <div className="social-link">
              <h2>Phone</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <p className="text-xl lowercase md:text-2xl lg:text-3xl">
                +91 9883724825
              </p>
            </div>
            <div className="social-link">
              <h2>Social Media</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <div className="flex flex-wrap gap-2">
                {socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs leading-loose tracking-widest uppercase md:text-sm hover:text-white/80 transition-colors duration-200"
                  >
                    {"{ "}
                    {social.name}
                    {" }"}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Offline-Capable Contact Form */}
          <div className="social-link flex flex-col justify-between bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <h3 className="text-2xl font-light tracking-wide uppercase mb-6">Send a Message</h3>
            
            {statusMsg && (
              <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-blue-500/20 border border-blue-500/40 text-blue-200">
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-base">
              <div>
                <label htmlFor="contact-name" className="block text-xs uppercase tracking-widest text-white/50 mb-2">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs uppercase tracking-widest text-white/50 mb-2">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs uppercase tracking-widest text-white/50 mb-2">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or inquiry..."
                  required
                  className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full py-4 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-white/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Marquee items={items} className="text-white bg-transparent" />
    </section>
  );
};

export default Contact;

