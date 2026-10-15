import { useCallback, useState } from "react";
import {
  INITIAL_REQUEST_FILTERS,
  type RequestFilterPatch,
  type RequestFilters,
} from "../types";

const INITIAL_OPTIONS = {
  deliveryMethod: INITIAL_REQUEST_FILTERS.deliveryMethod,
  status: INITIAL_REQUEST_FILTERS.status,
  sort: INITIAL_REQUEST_FILTERS.sort,
};

export function useRequestsFilters() {
  const [searchInput, setSearchInput] = useState("");
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [pageState, setPageState] = useState({ page: 0, forQuery: "" });
  const page = pageState.forQuery === searchInput ? pageState.page : 0;
  const filters: RequestFilters = { q: searchInput, ...options, page };

  const updateFilters = useCallback(
    (patch: RequestFilterPatch) => {
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
    setOptions(INITIAL_OPTIONS);
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
