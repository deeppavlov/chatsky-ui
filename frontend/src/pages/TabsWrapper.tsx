import { useSearchParams } from "react-router-dom"
import Flow from "./Flow"
import Logs from "./Logs"
import FootBar from "@/components/footbar/FootBar"
import Header from "@/components/header/Header"
import SideBar from "@/components/sidebar/SideBar"
import BuildManagerPage from "./BuildManagerPage"
import Settings from "./Settings"
import { useMemo } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import PopUpProvider from "@/contexts/popUpContext"
import { UndoRedoProvider } from "@/contexts/undoRedoContext"

const TabsWrapper = () => {
  const [searchParams] = useSearchParams()
  const pageTypes: Array<string> = ["edit", "deliver", "inspect", "settings"]
  const page = searchParams.get("page")
  const pageType = page && pageTypes.includes(page) ? page : "edit"

  const content = useMemo(() => {
    const pages: Record<string, JSX.Element> = {
      deliver: <BuildManagerPage />,
      inspect: <Logs />,
      settings: <Settings />,
      edit: <Flow />,
    }

    return pages[pageType] || <Flow />
  }, [pageType])
  return (
    <ReactFlowProvider>
      <PopUpProvider>
        <UndoRedoProvider>
          <div
            data-testid='flow-page'
            className='w-screen h-screen relative flex items-start bg-background overflow-x-hidden'
          >
            {pageType === "edit" ? <SideBar /> : <Header />}
            {content}
            <FootBar />
          </div>
        </UndoRedoProvider>
      </PopUpProvider>
    </ReactFlowProvider>
  )
}

export default TabsWrapper
