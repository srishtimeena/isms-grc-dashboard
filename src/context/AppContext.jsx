import { createContext, useContext } from "react";

/**
 * AppContext — provides global application state and mutation functions
 * to all child components, eliminating prop drilling.
 */
export const AppContext = createContext(null);

/** Typed hook with a helpful error for components used outside the provider */
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppContext.Provider>");
  return ctx;
};
