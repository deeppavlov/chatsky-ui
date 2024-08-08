import React, { createContext, useEffect, useState } from "react"
import { get_condition_methods } from "../api/services"

// context to set JSX element on the DOM

type dffMethodType = {
  label: string
  type: string
  info: string
  apply: string
}

type ideContextType = {
  methods: dffMethodType[]
  setMethods: React.Dispatch<React.SetStateAction<dffMethodType[]>>
}

export const IdeContext = createContext<ideContextType>({
  methods: [],
  setMethods: () => {},
})

interface PopUpProviderProps {
  children: React.ReactNode
}

const IdeProvider = ({ children }: PopUpProviderProps) => {
  const [methods, setMethods] = useState<dffMethodType[]>([])

  const getConditionMethods = async () => {
    const methods_data = await get_condition_methods()
    setMethods(methods_data.data)
  }

  useEffect(() => {
    getConditionMethods()
  }, [])

  return <IdeContext.Provider value={{ methods, setMethods }}>{children}</IdeContext.Provider>
}

export default IdeProvider
