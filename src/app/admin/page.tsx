"use client";

import { useState, useCallback } from "react";

interface RsvpEntry {
  name: string;
  contact: string;
  contactType: "email" | "phone";
  attending: boolean;
  adults: number;
  children: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (pw: string) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });

      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvps || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
        setStoredPassword(password);
        await fetchData(password);
      } else {
        setError("Invalid password.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contact: string, contactType: string) => {
    if (!confirm(`Delete RSVP for ${contact}?`)) return;

    try {
      const res = await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, contactType }),
      });

      if (res.ok) {
        await fetchData(storedPassword);
      }
    } catch {
      // silently fail
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
    setStoredPassword("");
    setRsvps([]);
  };

  const attendingRsvps = rsvps.filter((r) => r.attending !== false);
  const decliningRsvps = rsvps.filter((r) => r.attending === false);
  const totalAdults = attendingRsvps.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = attendingRsvps.reduce((sum, r) => sum + r.children, 0);

  if (!authenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login-card">
          <h1 className="admin-title">🔒 Admin Access</h1>
          <div className="gold-line" style={{ marginBottom: 28 }}></div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="admin-password"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !password}
              id="admin-login-btn"
            >
              {loading ? "Verifying..." : "Enter"}
            </button>
          </form>
          {error && (
            <div className="status-message status-error" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Graduation Party RSVPs</h1>
        <button onClick={handleLogout} className="logout-btn" id="admin-logout-btn">
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value" id="stat-attending">{attendingRsvps.length}</div>
          <div className="stat-label">Attending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" id="stat-declined">{decliningRsvps.length}</div>
          <div className="stat-label">Declined</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" id="stat-adults">{totalAdults}</div>
          <div className="stat-label">Adults</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" id="stat-children">{totalChildren}</div>
          <div className="stat-label">Children</div>
        </div>
      </div>

      {/* Total guests highlight */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
          padding: "14px 24px",
          background: "rgba(201, 168, 76, 0.08)",
          border: "1px solid rgba(201, 168, 76, 0.2)",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.1rem",
            color: "var(--gold-light)",
            letterSpacing: "0.05em",
          }}
        >
          Total Expected Guests:{" "}
          <strong
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.4rem",
              color: "var(--gold)",
            }}
          >
            {totalAdults + totalChildren}
          </strong>
        </span>
      </div>

      {/* Data table */}
      {rsvps.length === 0 ? (
        <div className="no-rsvps">No RSVPs yet. Share the link!</div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Adults</th>
                <th>Children</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{rsvp.name}</td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginRight: 6,
                      }}
                    >
                      {rsvp.contactType === "email" ? "✉" : "📱"}
                    </span>
                    {rsvp.contact}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      background: rsvp.attending !== false
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(231, 76, 76, 0.1)",
                      border: `1px solid ${rsvp.attending !== false
                        ? "rgba(76, 175, 80, 0.25)"
                        : "rgba(231, 76, 76, 0.25)"}`,
                      color: rsvp.attending !== false ? "#a5d6a7" : "#ef9a9a",
                    }}>
                      {rsvp.attending !== false ? "✓ Yes" : "✗ No"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>{rsvp.adults}</td>
                  <td style={{ textAlign: "center" }}>{rsvp.children}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(rsvp.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {rsvp.updatedAt !== rsvp.createdAt && (
                      <span style={{ display: "block", fontSize: "0.7rem", opacity: 0.7 }}>
                        updated{" "}
                        {new Date(rsvp.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(rsvp.contact, rsvp.contactType)}
                      id={`delete-${i}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
