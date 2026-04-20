import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentUser, logoutUser } from "@/services/auth.service";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      // ================= LOGIN =================
      login: (user) => {
        set({
          user,
          isAuthenticated: Boolean(user),
          loading: false,
        });
      },

      // ================= LOGOUT =================
      logout: async () => {
        try {
          await logoutUser();
        } catch (error) {
          console.error("Logout failed:", error);
        }

        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      },

      // ================= LOAD USER =================
      loadUser: async () => {
        try {
          const res = await getCurrentUser();
          const user = res?.data?.data;

          set({
            user,
            isAuthenticated: Boolean(user),
            loading: false,
          });
        } catch (error) {
          // On error, keep existing user if any (from persist), just set loading false
          set((state) => ({
            ...state,
            isAuthenticated: Boolean(state.user),
            loading: false,
          }));
        }
      },
    }),
    {
      name: "auth-store", // key in localStorage
    }
  )
);

export default useAuthStore;
