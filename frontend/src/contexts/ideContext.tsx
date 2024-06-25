import React, { createContext, useEffect, useState } from "react"
import { get_condition_methods } from "../api/services"

// context to set JSX element on the DOM

type ideContextType = {
  methods: string[]
  setMethods: React.Dispatch<React.SetStateAction<string[]>>
}

export const IdeContext = createContext<ideContextType>({
  methods: [],
  setMethods: () => {},
})

interface PopUpProviderProps {
  children: React.ReactNode
}

const IdeProvider = ({ children }: PopUpProviderProps) => {
  const [methods, setMethods] = useState<string[]>([])

  const getConditionMethods = async () => {
    const methods_data = await get_condition_methods()
    setMethods(methods_data)
    console.log(methods_data)
  }

  useEffect(() => {
    getConditionMethods()
  }, [])

  return <IdeContext.Provider value={{ methods, setMethods }}>{children}</IdeContext.Provider>
}

export default IdeProvider
