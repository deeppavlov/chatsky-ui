import { useContext, useEffect, useMemo } from "react"
import { ToastOptions, Toaster } from "react-hot-toast"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { themeContext } from "../contexts/themeContext"

const Index = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme } = useContext(themeContext)

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
            },
            position: "bottom-right",
          }
        : {
            style: {
              backgroundColor: "#333",
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

export default Index
