import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect } from "react";
import { useProgress } from "@bprogress/react";

export function ShellProgressBar() {
  const { start, stop } = useProgress();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isPending = isFetching || isMutating;

  useEffect(() => {
    if (isPending) {
      start(0.25, 125, true);
    } else {
      stop();
    }
  }, [isPending]);

  return null;
}
