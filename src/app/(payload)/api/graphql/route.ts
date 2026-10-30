import { NextResponse } from "next/server";

export function POST() {
  return new NextResponse("Not found", { status: 404 });
}

export function GET() {
  return new NextResponse("Not found", { status: 404 });
}
