import api from "@/api/client";
import { clearAuth, getToken } from "@/utils/authStorage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function index() {
  const [isLoggedIn, setIsLoaggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get("/driver/me");
        console.log(res.data.driver);
        if (res.data.driver) setIsLoaggedIn(true);
        else setIsLoaggedIn(false);
      } catch (error) {
        console.log("failed to retirve the token");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) return null;
  return <Redirect href={!isLoggedIn ? "/(routes)/login" : "/(tabs)/home"} />;
}
