import { createContext, useContext } from "react";
import React, { useState } from "react";
import { TabsContext } from "./tabsContext";

// context to set JSX element on the DOM
export const PopUpContext = createContext({
  openPopUp: (popUpElement: JSX.Element) => {},
  closePopUp: () => {},
  setCloseEdit: (value: string) => {},
  closeEdit: "",
});

interface PopUpProviderProps {
  children: React.ReactNode;
}

const PopUpProvider = ({ children }: PopUpProviderProps) => {
  const [popUpElements, setPopUpElements] = useState<JSX.Element[]>([]);

  const openPopUp = (element: JSX.Element) => {
    setPopUpElements((prevPopUps) => [element, ...prevPopUps]);
  };

  const closePopUp = () => {
    setPopUpElements((prevPopUps) => prevPopUps.slice(1));
  };

  const [closeEdit, setCloseEdit] = useState("");

  return (
    <PopUpContext.Provider
      value={{ openPopUp, closePopUp, closeEdit, setCloseEdit }}
    >
      {children}
      {popUpElements[0]}
    </PopUpContext.Provider>
  );
};

export default PopUpProvider;
