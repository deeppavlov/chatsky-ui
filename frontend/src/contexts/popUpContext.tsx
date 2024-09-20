import { AnimatePresence } from "framer-motion"
import React, { createContext, ReactNode, useContext, useState } from "react"
import { workspaceContext } from "./workspaceContext"

type PopUpContextType = {
  openPopUp: (element: JSX.Element, id: string) => void
  closePopUp: (id: string) => void
  setCloseEdit: React.Dispatch<React.SetStateAction<string>>
  closeEdit: string
  popUpElements: { id: string; element: JSX.Element }[]
}

export const PopUpContext = createContext<PopUpContextType>({
  openPopUp: () => {},
  closePopUp: () => {},
  setCloseEdit: () => {},
  closeEdit: "",
  popUpElements: [],
})

interface PopUpProviderProps {
  children: ReactNode
}

const PopUpProvider = ({ children }: PopUpProviderProps) => {
  const { setModalsOpened } = useContext(workspaceContext)
  const [popUpElements, setPopUpElements] = useState<{ id: string; element: JSX.Element }[]>([])
  const [closingId, setClosingId] = useState<string | null>(null)

  const openPopUp = (element: JSX.Element, id: string) => {
    setModalsOpened((prev) => prev + 1)
    setPopUpElements((prevPopUps) => [{ id, element }, ...prevPopUps])
  }

  const closePopUp = (id: string) => {
    setModalsOpened((prev) => prev - 1)
    setClosingId(id)
    // Время ожидания анимации
    setPopUpElements((prevPopUps) => prevPopUps.filter((popUp) => popUp.id !== id))
    setClosingId(null)
  }

  const [closeEdit, setCloseEdit] = useState("")

  return (
    <PopUpContext.Provider
      value={{ openPopUp, closePopUp, closeEdit, setCloseEdit, popUpElements }}>
      {children}
      <div id='modal_root'>
        <AnimatePresence>
          {popUpElements.map((popUp) => (
            <React.Fragment key={popUp.id}>{popUp.element}</React.Fragment>
          ))}
        </AnimatePresence>
      </div>
    </PopUpContext.Provider>
  )
}

export default PopUpProvider
