import React, { createContext, useEffect, useState } from "react"
import { get_config_version } from "../api/meta"

// context to set JSX element on the DOM

type metaContextType = {
  version: string
  setVersion: React.Dispatch<React.SetStateAction<string>>
}

export const MetaContext = createContext<metaContextType>({
  version: "",
  setVersion: () => {},
})

interface MetaProviderProps {
  children: React.ReactNode
}

const MetaProvider = ({ children }: MetaProviderProps) => {
  const [version, setVersion] = useState<string>("")

  const getVersion = async () => {
    const version_data = await get_config_version()
    setVersion(version_data)
  }

  useEffect(() => {
    getVersion()
  }, [])

  return <MetaContext.Provider value={{ version, setVersion }}>{children}</MetaContext.Provider>
}

export default MetaProvider
