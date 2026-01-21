"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

export default function IntroLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Lock scroll when component mounts
    document.body.style.overflow = "hidden";
    
    // Check session storage to see if we already showed the loader
    // Uncomment this if you want it to only show once per session
    /*
    const hasLoaded = sessionStorage.getItem("hasLoaded");
    if (hasLoaded) {
      setShow(false);
      document.body.style.overflow = "";
    }
    */
  }, []);

  const handleComplete = () => {
    setShow(false);
    document.body.style.overflow = "";
    // sessionStorage.setItem("hasLoaded", "true");
  };

  if (!show) return null;

  return <LoadingScreen onComplete={handleComplete} />;
}
