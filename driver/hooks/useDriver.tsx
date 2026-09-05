import { DriverType } from "@/@types/global";
import api from "@/api/client";
import { getDriver } from "@/utils/authStorage";
import { useEffect, useState } from "react";

export function useDriver() {
  const [driver, setDriver] = useState<DriverType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDriver = async () => {
      try {
        const driver = await api.get("/driver/me");
        setDriver(driver.data.driver);
      } catch (error) {
        console.log("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDriver();
  }, []);

  return {
    driver,
    loading,
  };
}
