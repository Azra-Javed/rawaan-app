import api from "@/api/client";
import { clearAuth, getToken } from "@/utils/authStorage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Toast } from "react-native-toast-notifications";

export default function index() {
  const [isLoggedIn, setIsLoaggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get("/user/me");
        if (res.data.user) setIsLoaggedIn(true);
        else setIsLoaggedIn(false);
      } catch (error: any) {
        Toast.show(error.message.response.data, { type: "danger" });
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) return null;
  return (
    <Redirect href={!isLoggedIn ? "/(routes)/onboarding" : "/(tabs)/home"} />
  );
}
