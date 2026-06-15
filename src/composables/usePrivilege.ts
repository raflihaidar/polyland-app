import { useAuthStore } from "@/stores/auth.store";

export const usePrivilege = () => {
  const authStore = useAuthStore();

  const can = (
    module: string,
    action: "create" | "read" | "update" | "delete" | "export",
  ) => {
    return authStore.canAccess(module, action);
  };

  return { can };
};
