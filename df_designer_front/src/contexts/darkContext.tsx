import { createContext, useEffect, useState } from "react";

type darkContextType = {
  dark: {};
  setDark: (newState: {}) => void;
  grid: boolean;
  setGrid: (newState: {}) => void;
};

const initialValue = {
  dark: {},
  setDark: () => {},
  grid: false,
  setGrid: () => {},
};

export const darkContext = createContext<darkContextType>(initialValue);

export function DarkProvider({ children }) {

  const [grid, setGrid] = useState(
    JSON.parse(window.localStorage.getItem("Grid")) ?? false,
  )

  useEffect(() => {
    window.localStorage.setItem("Grid", grid.toString())
  }, [grid])

  const [dark, setDark] = useState(
    JSON.parse(window.localStorage.getItem("isDark")) ?? false,
  );
  useEffect(() => {
    if (dark) {
      document.getElementById("body").classList.add("dark");
    } else {
      document.getElementById("body").classList.remove("dark");
    }
    window.localStorage.setItem("isDark", dark.toString());
  }, [dark]);
  return (
    <darkContext.Provider
      value={{
        dark,
        setDark,
        grid,
        setGrid
      }}
    >
      {children}
    </darkContext.Provider>
  );
}
