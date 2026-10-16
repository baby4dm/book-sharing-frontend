import { useCallback, useState } from "react";
import {
  INITIAL_EXCHANGE_FILTERS,
  type ExchangeFilterPatch,
  type ExchangeFilters,
} from "../types";

const INITIAL_OPTIONS = {
  role: INITIAL_EXCHANGE_FILTERS.role,
  deliveryMethod: INITIAL_EXCHANGE_FILTERS.deliveryMethod,
  status: INITIAL_EXCHANGE_FILTERS.status,
  sort: INITIAL_EXCHANGE_FILTERS.sort,
};

export function useExchangesFilters() {
  const [searchInput, setSearchInput] = useState("");
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [pageState, setPageState] = useState({ page: 0, forQuery: "" });
  const page = pageState.forQuery === searchInput ? pageState.page : 0;
  const filters: ExchangeFilters = { q: searchInput, ...options, page };

  const updateFilters = useCallback(
    (patch: ExchangeFilterPatch) => {
      const { page: nextPage, ...rest } = patch;
      if (Object.keys(rest).length > 0) {
        setOptions((prev) => ({ ...prev, ...rest }));
      }
      setPageState({ page: nextPage ?? 0, forQuery: searchInput });
    },
    [searchInput],
  );

  const reset = useCallback(() => {
    setSearchInput("");
    setOptions((prev) => ({ ...INITIAL_OPTIONS, role: prev.role }));
    setPageState({ page: 0, forQuery: "" });
  }, []);

  const hasActiveFilters =
    searchInput !== "" ||
    options.deliveryMethod !== null ||
    options.status !== null;

  return {
    filters,
    searchInput,
    setSearchInput,
    updateFilters,
    reset,
    hasActiveFilters,
  };
}
