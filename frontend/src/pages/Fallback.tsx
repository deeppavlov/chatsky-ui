import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Fallback = () => {

  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === "/app" || pathname === "/" || pathname === "" || pathname === "/app/") {
      navigate("/app/home")
    }
  }, [navigate, pathname])

  return (
    <div>404 NOT FOUND</div>
  )
}

export default Fallback