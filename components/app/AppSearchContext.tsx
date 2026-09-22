"use client";

import { createContext, useContext, useState } from "react";

interface AppSearchContextValue {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const AppSearchContext = createContext<AppSearchContextValue | null>(null);

export function AppSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <AppSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </AppSearchContext.Provider>
  );
}

export function useAppSearch() {
  const ctx = useContext(AppSearchContext);
  if (!ctx) {
    throw new Error("useAppSearch must be used within AppSearchProvider");
  }
  return ctx;
}
