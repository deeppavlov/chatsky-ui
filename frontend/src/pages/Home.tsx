import { useDisclosure } from '@nextui-org/react'
import { HomeIcon, Plus } from 'lucide-react'
import { useContext } from 'react'
import Header from '../components/header/Header'
import FlowCard from '../components/home/FlowCard'
import { flowContext } from '../contexts/flowContext'
import CreateFlowModal from '../modals/FlowModal/CreateFlowModal'

const Home = () => {
  const { flows } = useContext(flowContext)
  const { isOpen, onClose, onOpen } = useDisclosure()

  return (
    <div className='min-h-screen bg-background'>
      <div className='mb-8'>
        <Header />
      </div>
      <div className='flex flex-col items-start justify-start gap-8 px-20'>
        <div className='flex w-full select-none items-center justify-between'>
          <div>
            <h1 className='flex items-center gap-2 text-3xl font-semibold'>
              <HomeIcon /> Your skill
            </h1>
            <p>Choose a flow and start building</p>
          </div>
          <button
            data-testid='create-flow-btn'
            onClick={onOpen}
            className='flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 hover:border-node-selected hover:bg-bg-secondary'
          >
            <Plus className='h-5 w-5' /> Add flow
          </button>
        </div>
        <div className='flex w-full flex-wrap items-start justify-start gap-4'>
          {flows.length > 0 &&
            flows.map((flow) => (
              <FlowCard data-testid={flow.name} key={flow.name} flow={flow} />
            ))}
        </div>
      </div>
      <CreateFlowModal isOpen={isOpen} onClose={onClose} />
    </div>
  )
}

export default Home
