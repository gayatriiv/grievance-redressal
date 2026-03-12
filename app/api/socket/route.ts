import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Use websocket server for realtime updates (socket.io integration ready)." });
}
