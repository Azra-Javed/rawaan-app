import { clearAuth, getToken } from "@/utils/authStorage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function index() {
  const [isLoggedIn, setIsLoaggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const token = await getToken();
        if (token) {
          setIsLoaggedIn(true);
        } else {
          setIsLoaggedIn(false);
        }
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
