import { addUserWallet } from "@/actions/actions";
export async function addUsersWallet(userId: string, publicKey: string, chain: string) {
    return await addUserWallet(userId, publicKey, chain);
}
