import React, { useContext } from "react"
import { Logo } from "../../icons/Logo"
import { Button, useDisclosure } from "@nextui-org/react"
import { BellRing, Moon, Settings, Sun } from "lucide-react"
import { themeContext } from "../../contexts/themeContext"
import BuildMenu from "./BuildMenu"
import { Link } from "react-router-dom"
import SettingsModal from "../../modals/SettingsModal/SettingsModal"
import { workspaceContext } from "../../contexts/workspaceContext"

const Header = () => {
  const { toggleTheme, theme } = useContext(themeContext)
  const { toggleWorkspaceMode, workspaceMode, toggleNodesLayoutMode, nodesLayoutMode } = useContext(workspaceContext)
  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
  } = useDisclosure()

  return (
    <div className='min-h-14 flex items-center justify-between w-screen z-10 bg-bg-secondary border-b border-border px-2 pr-4'>
      <div className="flex items-center gap-4"> 
        <Link to='/app/home'>
          <Logo />
        </Link>
        <Button onClick={toggleWorkspaceMode} variant="ghost" >
          { workspaceMode ? "Free mode" : "Fix mode" }
        </Button>
        <Button onClick={toggleNodesLayoutMode} variant="ghost" >
          { nodesLayoutMode ? "Canvas Mode" : "List mode" }
        </Button>
      </div>
      <div className='flex items-center justify-start gap-1'>
        <BuildMenu />
        <Button
          onClick={onOpenSettingsModal}
          isIconOnly
          className='header-service-btn'>
          <Settings />
        </Button>
        <Button
          onClick={toggleTheme}
          isIconOnly
          className='header-service-btn'>
          {theme === "light" ? <Sun /> : <Moon />}
        </Button>
        <Button
          isIconOnly
          className='header-service-btn'>
          <BellRing />
        </Button>
      </div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={onCloseSettingsModal}
      />
    </div>
  )
}

export default Header
