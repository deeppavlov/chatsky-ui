import { useCallback, useContext } from "react"
import { flowContext } from "../contexts/flowContext"
import Header from "../components/header/Header"
import FlowCard from "../components/home/FlowCard"
import { HomeIcon, Plus } from "lucide-react"
import { PopUpContext } from "../contexts/popUpContext"
import CreateFlowModal from "../modals/FlowModal/CreateFlowModal"
import { useDisclosure } from "@nextui-org/react"

const Home = () => {
  const { flows, addFlow } = useContext(flowContext)
  const { openPopUp } = useContext(PopUpContext)
  const { isOpen, onClose, onOpen } = useDisclosure()

  return (
    <div className='min-h-screen bg-background'>
      <div className='mb-8'>
        <Header />
      </div>
      <div className='flex flex-col items-start justify-start gap-8 px-20'>
        <div className='flex items-center justify-between w-full'>
          <div>
            <h1 className='text-3xl font-semibold flex items-center gap-2'>
              <HomeIcon /> Your skill
            </h1>
            <p>Choose a flow and start building</p>
          </div>
          <button
            onClick={onOpen}
            className='py-1 px-2 bg-background border border-border rounded-md hover:border-node-selected hover:bg-bg-secondary flex items-center gap-2'>
            <Plus className="w-5 h-5" /> Add flow
          </button>
        </div>
        <div className='flex flex-wrap items-start justify-start gap-4 w-full'>
          {flows.length > 0 &&
            flows.map((flow) => (
              <FlowCard
                key={flow.name}
                flow={flow}
              />
            ))}
        </div>
      </div>
      <CreateFlowModal isOpen={isOpen} onClose={onClose} />
    </div>
  )
}

export default Home
