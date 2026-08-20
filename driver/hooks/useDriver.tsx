import { DriverType } from "@/@types/global";
import { getDriver } from "@/utils/authStorage";
import { useEffect, useState } from "react";

export function useUser() {
  const [driver, setDriver] = useState<DriverType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDriver = async () => {
      try {
        const storedDriver = await getDriver();
        setDriver(storedDriver);
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
