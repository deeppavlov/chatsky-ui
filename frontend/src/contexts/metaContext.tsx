import React, { createContext, useEffect, useState } from "react"
import { get_config_version } from "../api/meta"

// context to set JSX element on the DOM

type metaContextType = {
  version: string
  setVersion: React.Dispatch<React.SetStateAction<string>>
  setScreenLoading: React.Dispatch<React.SetStateAction<number>>
  screenLoading: {
    addScreenLoading: () => void
    removeScreenLoading: () => void
    value: number
  }
}

export const MetaContext = createContext<metaContextType>({
  version: "",
  setVersion: () => {},
  screenLoading: {
    addScreenLoading: () => {},
    removeScreenLoading: () => {},
    value: 0,
  },
  setScreenLoading: () => {},
})

interface MetaProviderProps {
  children: React.ReactNode
}

const MetaProvider = ({ children }: MetaProviderProps) => {
  const [screenLoading, setScreenLoading] = useState<number>(0)
  const [version, setVersion] = useState<string>("")

  const addScreenLoading = () => {
    setScreenLoading((prev) => prev + 1)
  }

  const removeScreenLoading = () => {
    setScreenLoading((prev) => prev - 1)
  }

  const getVersion = async () => {
    addScreenLoading()
    try {
      const version_data = await get_config_version()
      setVersion(version_data)
    } catch (error) {
      console.error(error)
    } finally {
      removeScreenLoading()
    }
  }

  useEffect(() => {
    getVersion()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MetaContext.Provider
      value={{
        version,
        setVersion,
        screenLoading: {
          addScreenLoading,
          removeScreenLoading,
          value: screenLoading,
        },
        setScreenLoading,
      }}>
      {children}
    </MetaContext.Provider>
  )
}

export default MetaProvider
