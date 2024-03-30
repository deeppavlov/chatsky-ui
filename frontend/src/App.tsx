import React, { useContext, useMemo } from "react"
import { Outlet } from "react-router-dom"
import { themeContext } from "./contexts/themeContext"
import { ToastOptions, Toaster } from "react-hot-toast"
import ContextWrapper from "./contexts"

const App = () => {
  const { theme } = useContext(themeContext)

  const toastOptions: ToastOptions = useMemo(
    () =>
      theme === "light"
        ? {
            style: {
              backgroundColor: "#fff",
              color: "#333",
            },
            position: "bottom-right",
          }
        : {
            style: {
              backgroundColor: "#333",
              color: "#fff",
            },
            position: "bottom-right",
          },
    [theme]
  )

  return (
    <div className={`${theme}`}>
      <Toaster toastOptions={toastOptions} />
      <Outlet />
    </div>
  )
}

export default App
