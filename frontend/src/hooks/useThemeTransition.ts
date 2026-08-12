"use client";

import { useTheme } from "next-themes";

export function useThemeTransition() {
  const { theme, setTheme } = useTheme();

  const toggleThemeWithTransition = (
    newTheme: string,
    event?: React.MouseEvent | MouseEvent
  ) => {
    const x = event ? event.clientX : window.innerWidth / 2;
    const y = event ? event.clientY : window.innerHeight / 2;

    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);

    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as any).startViewTransition === "function"
    ) {
      root.classList.add("vt-active");
      const transition = (document as any).startViewTransition(() => {
        setTheme(newTheme);
      });

      transition.finished.finally(() => {
        root.classList.remove("vt-active");
      });
    } else {
      setTheme(newTheme);
    }
  };

  return { theme, setTheme, toggleThemeWithTransition };
}
