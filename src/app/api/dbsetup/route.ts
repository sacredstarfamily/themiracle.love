import { NextResponse } from "next/server";
//import conn from "../lib/db";

export async function GET() {
  return NextResponse.json({ message: "p" }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ message: "POST Request" }, { status: 200 });
}
