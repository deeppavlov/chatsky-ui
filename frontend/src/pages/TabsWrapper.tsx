import FootBar from '@/components/footbar/FootBar'
import Header from '@/components/header/Header'
import SideBar from '@/components/sidebar/SideBar'
import PopUpProvider from '@/contexts/popUpContext'
import { UndoRedoProvider } from '@/contexts/undoRedoContext'
import { ReactFlowProvider } from '@xyflow/react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import BuildManagerPage from './BuildManagerPage'
import Flow from './Flow'
import Logs from './Logs'
import Settings from './Settings'

const TabsWrapper = () => {
  const [searchParams] = useSearchParams()
  const pageTypes: Array<string> = ['edit', 'deliver', 'inspect', 'settings']
  const page = searchParams.get('page')
  const pageType = page && pageTypes.includes(page) ? page : 'edit'

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
            className='relative flex h-screen w-screen items-start overflow-x-hidden bg-background'
          >
            {pageType === 'edit' ? <SideBar /> : <Header />}
            {content}
            <FootBar />
          </div>
        </UndoRedoProvider>
      </PopUpProvider>
    </ReactFlowProvider>
  )
}

export default TabsWrapper
