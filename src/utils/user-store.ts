import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '@/types/index';

interface UserState {
  user: IUser | null;
}

interface UserActions {
  setUser: (user: IUser | null) => void;
  updateUser: (fields: Partial<IUser>) => void;
  clearUser: () => void;
  isLoggedIn: () => boolean;
  setUserField: <K extends keyof IUser>(key: K, value: IUser[K]) => void;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (fields) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...fields } } : state
        ),
      clearUser: () => set({ user: null }),
      isLoggedIn: () => !!get().user,
      setUserField: (key, value) =>
        set((state) =>
          state.user ? { user: { ...state.user, [key]: value } } : state
        )
    }),
    { name: 'user-store', skipHydration: true }
  )
);
