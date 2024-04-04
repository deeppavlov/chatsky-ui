import React, { useContext, useEffect, useMemo } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { themeContext } from "./contexts/themeContext"
import { ToastOptions, Toaster } from "react-hot-toast"
import ContextWrapper from "./contexts"

const App = () => {
  const { theme } = useContext(themeContext)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === "/app" || pathname === "/" || pathname === "" || pathname === "/app/") {
      navigate("/app/home")
    }
  }, [navigate, pathname])

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
