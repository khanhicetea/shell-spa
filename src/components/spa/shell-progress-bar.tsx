import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useProgress } from "@bprogress/react";

export function ShellProgressBar() {
  const { start, stop } = useProgress();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const pendingRequests = isFetching + isMutating;

  useEffect(() => {
    if (pendingRequests > 0) {
      start(0.2, 125); // start progress bar if it slower than 125ms, start from 20%
    } else if (pendingRequests === 0) {
      stop(20, 20); // should wait another subsequent request for 20ms before stopping
    }
    console.log({ pendingRequests });
  }, [pendingRequests]);

  return null;
}
