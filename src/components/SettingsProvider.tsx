"use client";
import { createContext, useContext, ReactNode } from "react";

type GlobalSettings = {
  freeDelivery: {
    is_active: boolean;
    threshold: number;
  };
};

const defaultSettings: GlobalSettings = {
  freeDelivery: {
    is_active: true,
    threshold: 2000,
  }
};

const SettingsContext = createContext<GlobalSettings>(defaultSettings);

export function SettingsProvider({ children, initialSettings }: { children: ReactNode, initialSettings?: GlobalSettings }) {
  return (
    <SettingsContext.Provider value={initialSettings || defaultSettings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
