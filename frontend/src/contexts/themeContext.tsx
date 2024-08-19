import React, { createContext, useCallback, useEffect, useState } from "react"

type themeType = "dark" | "light"
type TabContextType = {
  theme: themeType
  setTheme: React.Dispatch<React.SetStateAction<themeType>>
  toggleTheme: () => void
}

const initialValue: TabContextType = {
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
}

// eslint-disable-next-line react-refresh/only-export-components
export const themeContext = createContext(initialValue)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<themeType>('dark')

  useEffect(() => {
    const _theme = localStorage.getItem("theme") as themeType
    setTheme(_theme ?? "dark")
    document.body.classList.add(_theme ?? "dark")
  }, [])

  const toggleTheme = useCallback(() => {
    if (theme === "light") {
      localStorage.setItem("theme", "dark")
      document.body.classList.remove("light")
      document.body.classList.add("dark")
      setTheme("dark")
    } else {
      localStorage.setItem("theme", "light")
      document.body.classList.remove("dark")
      document.body.classList.add("light")
      setTheme("light")
    }
  }, [setTheme, theme])

  return (
    <themeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}>
      {children}
    </themeContext.Provider>
  )
}
