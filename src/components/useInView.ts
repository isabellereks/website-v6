"use client";

import { useEffect, useRef } from "react";

// Sets data-inview="true" on the element the first time it scrolls into view.
// CSS keys line drawings and reveals off that attribute.
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute("data-inview", "true");
        observer.disconnect();
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
