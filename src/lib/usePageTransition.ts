"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function usePageTransition() {
  const router = useRouter();

  const navigate = useCallback(
    (path: string) => {
      // Check if View Transitions API is supported
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          router.push(path);
        });
      } else {
        // Fallback for browsers without support
        router.push(path);
      }
    },
    [router]
  );

  const goBack = useCallback(() => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        router.back();
      });
    } else {
      router.back();
    }
  }, [router]);

  return { navigate, goBack, router };
}
