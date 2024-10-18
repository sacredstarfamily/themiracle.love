import { NextResponse } from "next/server";
import conn from "../lib/db";


export async function GET() {
   const client = await conn.connect();
   const result = await client.query('CREATE TABLE products (product_id serial PRIMARY KEY, name VARCHAR(50), price DOUBLE PRECISION)');
   const results = { 'results': (result) ? result.rows : null};
    client.release();
    return NextResponse.json({ message: results }, { status: 200 })
 }

export async function POST() {
    return NextResponse.json({ message: "POST Request" }, { status: 200 })
}