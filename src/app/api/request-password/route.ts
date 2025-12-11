import { requestPasswordUpdate } from "@/actions/actions";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const result = await requestPasswordUpdate(undefined, formData);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Request password API error:", error);
        return NextResponse.json(
            { data: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}