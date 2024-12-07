import { create } from 'zustand';

interface AuthStore {
    isLoggedIn: boolean,
    login: () => void,
    logout: () => void
}
const useAuthStore = create<AuthStore>((set) => ({
    login: () => {
        console.log('login');
        set({ isLoggedIn: true });
    },
    logout: () => {
        console.log('logout');
        set({ isLoggedIn: false });
    },
    isLoggedIn: false
}));

export default useAuthStore;