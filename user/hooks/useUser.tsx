import api from "@/api/client";
import { getUser } from "@/utils/authStorage";
import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<UserType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
       const response = await api.get("/user/me");
       console.log("User data in useUser hook:", response.data.user);
        const storedUser = response.data.user;
        setUser(storedUser);
      } catch (error) {
        console.log("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    user,
    loading,
  };
}
