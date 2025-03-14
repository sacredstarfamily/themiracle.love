export type SessionPayload = {
    email: string;
    expiresAt: Date;
}
export type User = {
    id: string;
    name: string | null;
    email: string;
    hashedPassword?: string | null;
    verificationToken?: string | null;
    sessionToken: string | null;
    emailVerified?: boolean;
    walletAddress?: string | null;
    passwordResetLink?: string | null;
    passwordResetToken?: number | null;
    passwordResetExpiry?: Date | null;
}