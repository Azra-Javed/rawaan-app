import { Redirect } from "expo-router";
import { useState } from "react";

export default function index() {
  const [isLoggedIn, setIsLoaggedIn] = useState(false);

  return (
    <Redirect
      href={!isLoggedIn ? "/(routes)/onbaording/index" : "/(tabs)/home"}
    />
  );
}
