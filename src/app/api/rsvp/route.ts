import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

function normalizeContact(contact: string, contactType: string): string {
  if (contactType === "email") {
    return contact.toLowerCase().trim();
  }
  // Strip non-digits for phone comparison
  return contact.replace(/\D/g, "").trim();
}

// GET: Look up existing RSVP by contact
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contact = searchParams.get("contact");
  const contactType = searchParams.get("contactType") || "email";

  if (!contact) {
    return NextResponse.json({ found: false });
  }

  const db = await getDb();
  const normalized = normalizeContact(contact, contactType);

  const existing = await db.collection("rsvps").findOne({
    contactType,
    normalizedContact: normalized,
  });

  if (existing) {
    return NextResponse.json({
      found: true,
      rsvp: {
        name: existing.name,
        contact: existing.contact,
        contactType: existing.contactType,
        adults: existing.adults,
        children: existing.children,
      },
    });
  }

  return NextResponse.json({ found: false });
}

// POST: Create or update RSVP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact, contactType, adults, children } = body;

    // Validation
    if (!name || !contact || !contactType) {
      return NextResponse.json(
        { error: "Name and contact information are required." },
        { status: 400 }
      );
    }

    if (!["email", "phone"].includes(contactType)) {
      return NextResponse.json(
        { error: "Invalid contact type." },
        { status: 400 }
      );
    }

    if (
      contactType === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    ) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const adultsNum = Math.max(1, Math.min(10, parseInt(adults) || 1));
    const childrenNum = Math.max(0, Math.min(10, parseInt(children) || 0));

    const db = await getDb();
    const normalized = normalizeContact(contact, contactType);
    const now = new Date().toISOString();

    const result = await db.collection("rsvps").updateOne(
      { contactType, normalizedContact: normalized },
      {
        $set: {
          name: name.trim(),
          contact: contact.trim(),
          contactType,
          normalizedContact: normalized,
          adults: adultsNum,
          children: childrenNum,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      return NextResponse.json({
        message: "RSVP submitted successfully.",
        updated: false,
      });
    } else {
      return NextResponse.json({
        message: "RSVP updated successfully.",
        updated: true,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request data." },
      { status: 400 }
    );
  }
}

// DELETE: Remove an RSVP (admin use)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, contactType } = body;

    if (!contact || !contactType) {
      return NextResponse.json(
        { error: "Contact info required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const normalized = normalizeContact(contact, contactType);

    const result = await db.collection("rsvps").deleteOne({
      contactType,
      normalizedContact: normalized,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "RSVP not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "RSVP deleted." });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
