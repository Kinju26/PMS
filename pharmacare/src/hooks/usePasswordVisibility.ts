"use client";

import { useState } from "react";

export function usePasswordVisibility() {
  const [visible, setVisible] = useState(false);

  return {
    visible,
    inputType: visible ? ("text" as const) : ("password" as const),
    toggle: () => setVisible((current) => !current),
  };
}
