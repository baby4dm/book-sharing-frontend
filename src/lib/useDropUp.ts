import { useLayoutEffect, useState, type RefObject } from "react";

export function useDropUp(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  popupHeight = 320,
): boolean {
  const [dropUp, setDropUp] = useState(false);
  useLayoutEffect(() => {
    if (!isOpen || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    setDropUp(below < popupHeight && above > below);
  }, [isOpen, ref, popupHeight]);
  return dropUp;
}
