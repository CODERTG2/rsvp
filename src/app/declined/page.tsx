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

export default function DeclinedPage() {
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

          {/* Envelope icon */}
          <div className="confirm-icon-wrapper confirm-icon-declined">
            <span className="confirm-emoji">📨</span>
          </div>

          <h1 className="confirm-title">Response Received</h1>

          <div className="gold-line" style={{ margin: '16px auto 24px' }} />

          <p className="confirm-message">
            <strong>Thank you for letting us know.</strong>
          </p>
          <p className="confirm-detail">
            We&apos;re sorry you can&apos;t make it — you will be missed! Your response has been saved.
          </p>

          <div className="confirm-note">
            Changed your mind? You can always go back and update your RSVP using your email or phone number.
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
