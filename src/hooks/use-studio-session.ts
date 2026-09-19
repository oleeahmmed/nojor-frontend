"use client";

import { useEffect, useState } from "react";
import { getStudioName, isStudioLoggedIn } from "@/lib/studio";

/** Studio/staff session — Create button gating + profile. */
export function useStudioSession() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const sync = () => {
      setLoggedIn(isStudioLoggedIn());
      setName(getStudioName());
    };
    sync();
    window.addEventListener("nojor-studio", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("nojor-studio", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return { loggedIn, name };
}
