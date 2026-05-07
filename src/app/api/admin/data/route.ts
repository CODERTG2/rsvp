import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const rsvps = await db
      .collection("rsvps")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Strip MongoDB _id for the response
    const cleaned = rsvps.map(({ _id, normalizedContact, ...rest }) => rest);

    return NextResponse.json({ rsvps: cleaned });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
