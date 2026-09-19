"use client";

import { useEffect, useState } from "react";
import { isStudioLoggedIn } from "@/lib/studio";

/** Studio/staff session — Create button gating. */
export function useStudioSession() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(isStudioLoggedIn());
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

  return loggedIn;
}
