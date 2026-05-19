import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      usuario: null,
      setUsuario: (usuario) => set({ usuario }),
      clearUsuario: () => set({ usuario: null }),
    }),
    {
      name: "auth-storage", // clave en localStorage
    }
  )
);
