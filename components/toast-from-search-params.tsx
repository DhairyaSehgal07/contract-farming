"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { isToastKey, toastMessages } from "@/lib/toast";

export function ToastFromSearchParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    const toastKey = searchParams.get("toast");
    const error = searchParams.get("error");
    const signature = `${pathname}|${toastKey ?? ""}|${error ?? ""}`;

    if (handledRef.current === signature) {
      return;
    }

    if (!toastKey && !error) {
      return;
    }

    handledRef.current = signature;

    if (toastKey && isToastKey(toastKey)) {
      const message = toastMessages[toastKey];
      toast.success(message.title, { description: message.description });
    }

    if (error) {
      toast.error("Sign in failed", {
        description: error,
      });
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("toast");
    nextParams.delete("error");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  return null;
}
