"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

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

export default function ConfirmedPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="bg-canvas">
        <Particles />
      </div>

      <main className="page-container">
        <div className="confirmation-card" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)' }}>

          {/* Big animated checkmark */}
          <div className="confirm-icon-wrapper confirm-icon-success">
            <svg className="confirm-checkmark" viewBox="0 0 52 52" width="64" height="64">
              <circle className="confirm-checkmark-circle" cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path className="confirm-checkmark-check" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" d="M15 27l7 7 15-15" />
            </svg>
          </div>

          <h1 className="confirm-title">You&apos;re All Set!</h1>

          <div className="gold-line" style={{ margin: '16px auto 24px' }} />

          <p className="confirm-message">
            🎉 <strong>RSVP Submitted!</strong>
          </p>
          <p className="confirm-detail">
            Thank you for confirming your attendance. We look forward to celebrating with you!
          </p>

          <div className="confirm-event-box">
            <p className="confirm-event-label">Event Details</p>
            <p className="confirm-event-text">📅 Saturday, May 23rd 2026</p>
            <p className="confirm-event-text">🕕 6:00 PM – 8:30 PM</p>
            <p className="confirm-event-text">📍 801 S Plymouth Ct, Chicago, IL</p>
          </div>

          <div className="confirm-note">
            If you need to make changes to your RSVP, you can return to the main page and enter your contact info to edit it.
          </div>

          <Link href="/" className="confirm-btn" id="btn-back-home">
            ← Back to Invitation
          </Link>
        </div>

        <p className="footer-note">
          Tanmay Garg · Class of 2026 · Graduation Celebration
        </p>
      </main>
    </>
  );
}
