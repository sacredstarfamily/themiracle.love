import { createUser } from "@/actions/actions";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const result = await createUser(undefined, formData);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Signup API error:", error);
        return NextResponse.json(
            { data: `Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}