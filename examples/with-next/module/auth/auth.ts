import { create } from 'zustand';
import { AuthenticationStatus } from '@rainbow-me/rainbowkit';

export const useAuthStore = create<{
  status: AuthenticationStatus;
  setStatus: (v: AuthenticationStatus) => void;
}>(set => ({
  status: 'unauthenticated',
  setStatus: (v: AuthenticationStatus) => set({ status: v }),
}));
