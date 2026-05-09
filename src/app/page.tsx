"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface RsvpData {
  name: string;
  contact: string;
  contactType: "email" | "phone";
  attending: boolean;
  adults: number;
  children: number;
}

function Particles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 18 }, (_, i) => {
      const size = Math.random() * 3 + 1;
      const isGold = Math.random() > 0.5;
      return {
        id: i,
        size,
        left: `${Math.random() * 100}%`,
        duration: `${Math.random() * 18 + 14}s`,
        delay: `${Math.random() * 12}s`,
        color: isGold
          ? `rgba(201, 168, 76, ${Math.random() * 0.3 + 0.05})`
          : `rgba(180, 188, 220, ${Math.random() * 0.1 + 0.03})`,
      };
    });
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            backgroundColor: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </>
  );
}

export default function Home() {
  const router = useRouter();
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);

  // Debounced lookup for existing RSVP
  const statusRef = useRef(status);
  statusRef.current = status;

  const lookupRsvp = useCallback(
    async (contactValue: string, type: "email" | "phone") => {
      if (!contactValue || contactValue.length < 5) {
        setIsEditing(false);
        setLookupDone(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/rsvp?contact=${encodeURIComponent(contactValue)}&contactType=${type}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.found) {
            setName(data.rsvp.name);
            setAttending(data.rsvp.attending !== undefined ? data.rsvp.attending : true);
            setAdults(data.rsvp.adults);
            setChildren(data.rsvp.children);
            setIsEditing(true);
            setLookupDone(true);
            setStatus({
              type: "info",
              message: "We found your RSVP! Update your details below.",
            });
          } else {
            setIsEditing(false);
            setLookupDone(true);
            if (statusRef.current?.type === "info") setStatus(null);
          }
        }
      } catch {
        // silently fail lookup
      }
    },
    [] // no dependencies — uses ref for status
  );

  // Debounce effect for contact field
  useEffect(() => {
    const timer = setTimeout(() => {
      lookupRsvp(contact, contactType);
    }, 600);
    return () => clearTimeout(timer);
  }, [contact, contactType, lookupRsvp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // Basic validation
    if (!name.trim()) {
      setStatus({ type: "error", message: "Please enter your name." });
      setIsSubmitting(false);
      return;
    }
    if (!contact.trim()) {
      setStatus({
        type: "error",
        message: `Please enter your ${contactType === "email" ? "email address" : "phone number"}.`,
      });
      setIsSubmitting(false);
      return;
    }

    if (
      contactType === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    ) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      setIsSubmitting(false);
      return;
    }

    if (contactType === "phone") {
      const digits = contact.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        setStatus({
          type: "error",
          message: "Please enter a valid phone number (10+ digits with country code).",
        });
        setIsSubmitting(false);
        return;
      }
    }

    if (attending === null) {
      setStatus({ type: "error", message: "Please let us know if you will attend." });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          contactType,
          attending: !!attending,
          adults: attending ? adults : 0,
          children: attending ? children : 0,
        } as RsvpData),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to confirmation page
        router.push(attending ? "/confirmed" : "/declined");
      } else {
        setStatus({
          type: "error",
          message: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Animated background */}
      <div className="bg-canvas">
        <Particles />
      </div>

      <main className="page-container">
        {/* Top flourish */}
        <div className="top-flourish">
          <p className="top-flourish-text">You&apos;re Invited</p>
          <div className="top-flourish-line" />
        </div>

        {/* Invitation Image */}
        <section className="invitation-section">
          <div className="invitation-image-wrapper">
            <Image
              src="/Invitation.png"
              alt="Graduation Party Invitation — Tanmay Garg, Class of 2026. Saturday, May 23rd 2026, 6:00 PM – 8:30 PM at 801 S Plymouth Ct, Chicago, IL"
              width={500}
              height={707}
              priority
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider">
          <div className="section-divider-line" />
          <span className="section-divider-icon">✦</span>
          <div className="section-divider-line" />
        </div>

        {/* RSVP Form */}
        <section className="rsvp-section">
          <div className="rsvp-card">
            <h1 className="rsvp-title">RSVP</h1>
            <p className="rsvp-subtitle">Kindly respond by May 12th, 2026</p>
            <div className="gold-line-wide" style={{ marginBottom: 28 }} />

            <form onSubmit={handleSubmit} id="rsvp-form">
              {/* Contact Type Toggle */}
              <div className="form-group">
                <label className="form-label">Contact Method</label>
                <div className="contact-toggle">
                  <button
                    type="button"
                    className={`contact-toggle-btn ${contactType === "email" ? "active" : ""}`}
                    onClick={() => {
                      setContactType("email");
                      setContact("");
                      setIsEditing(false);
                      setLookupDone(false);
                      setStatus(null);
                    }}
                    id="toggle-email"
                  >
                    ✉️ Email
                  </button>
                  <button
                    type="button"
                    className={`contact-toggle-btn ${contactType === "phone" ? "active" : ""}`}
                    onClick={() => {
                      setContactType("phone");
                      setContact("");
                      setIsEditing(false);
                      setLookupDone(false);
                      setStatus(null);
                    }}
                    id="toggle-phone"
                  >
                    📱 Phone
                  </button>
                </div>
                <input
                  type={contactType === "email" ? "email" : "tel"}
                  className="form-input"
                  placeholder={
                    contactType === "email"
                      ? "your@email.com"
                      : "(555) 123-4567"
                  }
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  id="input-contact"
                  autoComplete={contactType === "email" ? "email" : "tel"}
                />
              </div>

              {isEditing && (
                <div className="existing-rsvp-notice">
                  <span>📝</span>
                  Editing your existing RSVP. Update any details and re-submit.
                </div>
              )}

              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="input-name">
                  Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="input-name"
                  autoComplete="name"
                />
              </div>

              {/* Will you attend? */}
              <div className="form-group">
                <label className="form-label">Will You Attend?</label>
                <div className="attend-toggle">
                  <button
                    type="button"
                    className={`attend-toggle-btn attend-yes ${attending === true ? "active" : ""}`}
                    onClick={() => setAttending(true)}
                    id="toggle-attend-yes"
                  >
                    <span className="attend-icon">🎉</span>
                    <span>Joyfully Accept</span>
                  </button>
                  <button
                    type="button"
                    className={`attend-toggle-btn attend-no ${attending === false ? "active" : ""}`}
                    onClick={() => setAttending(false)}
                    id="toggle-attend-no"
                  >
                    <span className="attend-icon">😔</span>
                    <span>Regretfully Decline</span>
                  </button>
                </div>
              </div>

              {/* Guests count — only when attending */}
              {attending === true && (
                <div className="guest-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Adults</label>
                      <div className="counter-group">
                        <button
                          type="button"
                          className="counter-btn"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          aria-label="Decrease adults"
                          id="btn-adults-minus"
                        >
                          −
                        </button>
                        <span className="counter-value" id="adults-count">
                          {adults}
                        </span>
                        <button
                          type="button"
                          className="counter-btn"
                          onClick={() => setAdults(Math.min(10, adults + 1))}
                          aria-label="Increase adults"
                          id="btn-adults-plus"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Children</label>
                      <div className="counter-group">
                        <button
                          type="button"
                          className="counter-btn"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          aria-label="Decrease children"
                          id="btn-children-minus"
                        >
                          −
                        </button>
                        <span className="counter-value" id="children-count">
                          {children}
                        </span>
                        <button
                          type="button"
                          className="counter-btn"
                          onClick={() => setChildren(Math.min(10, children + 1))}
                          aria-label="Increase children"
                          id="btn-children-plus"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
                id="btn-submit"
              >
                {isSubmitting
                  ? "Submitting..."
                  : isEditing
                    ? "Update RSVP"
                    : attending === false
                      ? "Send Regrets"
                      : "Submit RSVP"}
              </button>
            </form>

            {status && (
              <div
                className={`status-message ${status.type === "success"
                    ? "status-success"
                    : status.type === "error"
                      ? "status-error"
                      : "status-info"
                  }`}
                id="status-message"
              >
                {status.message}
              </div>
            )}
          </div>
        </section>

        <p className="footer-note">
          Tanmay Garg · Class of 2026 · Graduation Celebration
        </p>
      </main>
    </>
  );
}
