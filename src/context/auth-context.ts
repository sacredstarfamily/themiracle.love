import { User } from '@/lib/definitions';
import { create } from 'zustand';

interface AuthStore {
    user: User | null
    isLoggedIn: boolean,
    login: (arg0: User) => void,
    logout: () => void
}
const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    login: (user) => {
        set({
            user: {
                name: user.name,
                email: user.email,
                id: user.id,
                sessionToken: user.sessionToken,
            }
        });
        set({ isLoggedIn: true });
    },
    logout: () => {

        set({ isLoggedIn: false });
    },
    isLoggedIn: false
}));

export default useAuthStore;