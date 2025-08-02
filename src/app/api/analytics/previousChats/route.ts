import { NextResponse } from "next/server";
import Message from "@/models/Messages";
import { withAuth } from "@/lib/services/withAuth";
import { DecodedIdToken } from "firebase-admin/auth";

export const GET = withAuth(async (_req: Request, _user: DecodedIdToken) => {
    const uid = _user.uid;

    if (!uid) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const chats = await Message.find({ userId: uid }).sort({ createdAt: -1 });
    return NextResponse.json(chats);
}) 