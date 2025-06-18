import { Button, Divider, useDisclosure } from '@nextui-org/react'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronLeftIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { memo, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import EditNodeIcon from '../../icons/nodes/EditNodeIcon'
import LinksIcon from '../../icons/sidebar/LinksIcon'
import NodesIcon from '../../icons/sidebar/NodesIcon'
import CreateFlowModal from '../../modals/FlowModal/CreateFlowModal'
import ManageFlowsModal from '../../modals/FlowModal/ManageFlowsModal'
import Header from '../header/Header'
import { DragList } from './DragList'
import DragListItem from './DragListItem'
import FlowItem from './FlowItem'

const SideBar = memo(() => {
  const { flows } = useContext(flowContext)
  const { flowId } = useParams()
  const {
    isOpen: isCreateFlowModalOpen,
    onOpen: onOpenCreateFlowModal,
    onClose: onCloseCreateFlowModal,
  } = useDisclosure()
  const {
    isOpen: isManageFlowsModalOpen,
    onOpen: onOpenManageFlowsModal,
    onClose: onCloseManageFlowsModal,
  } = useDisclosure()

  const activeFlow = useMemo(() => flowId, [flowId])
  const globalFlow = useMemo(
    () => flows.find((flow) => flow.name === 'Global'),
    [flows],
  )

  const [openItems, setOpenItems] = useState<string[]>([])

  return (
    <div
      data-testid='sidebar'
      className='flex h-full w-52 flex-col items-start'
    >
      <Header />
      <div className='flex h-full w-full flex-col justify-between overflow-hidden border-r border-border bg-background px-2 pb-14'>
        <div className='flex h-full flex-col gap-3'>
          <div>
            <div
              data-testid='flows-list'
              className='flex items-center justify-between'
            >
              <p className='my-4 font-semibold'>Flows</p>
              <div className='flex items-center gap-1.5'>
                <Button
                  className='border-1'
                  onClick={onOpenManageFlowsModal}
                  size='sm'
                  variant='bordered'
                  isIconOnly
                >
                  <EditNodeIcon fillOpacity={'1'} />
                </Button>
                <Button
                  className='border-1'
                  onClick={onOpenCreateFlowModal}
                  size='sm'
                  variant='bordered'
                  isIconOnly
                >
                  <Plus />
                </Button>
              </div>
            </div>
            <div className='mb-2 flex w-full flex-col items-start justify-start gap-0.5'>
              {globalFlow && (
                <FlowItem
                  flows={flows}
                  key={globalFlow.name}
                  flow={globalFlow}
                  activeFlow={activeFlow!}
                />
              )}
            </div>
            <Divider />
          </div>
          <p className='font-semibold'>Available components</p>
          <div className='overflow-y-auto scrollbar-hide'>
            <Accordion.Root
              value={openItems}
              onValueChange={setOpenItems}
              type='multiple'
              className='flex flex-col gap-2 px-0'
            >
              <Accordion.Item value='nodes'>
                <Accordion.Trigger className='group w-full rounded-lg border border-border bg-bg-secondary p-2'>
                  <div
                    data-testid='nodes-collapse-btn'
                    className='flex items-center justify-start gap-2'
                  >
                    <NodesIcon />
                    Nodes
                    <ChevronLeftIcon className='ms-auto h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-[-90deg]' />
                  </div>
                </Accordion.Trigger>

                <AnimatePresence>
                  {openItems.includes('nodes') && (
                    <motion.div
                      className='mt-2 overflow-hidden'
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DragList />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Accordion.Item>

              <Accordion.Item value='links'>
                <Accordion.Trigger className='group w-full rounded-lg border border-border bg-bg-secondary p-2'>
                  <div
                    data-testid='links-collapse-btn'
                    className='flex items-center justify-start gap-2'
                  >
                    <LinksIcon />
                    Links
                    <ChevronLeftIcon className='ms-auto h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-[-90deg]' />
                  </div>
                </Accordion.Trigger>

                <AnimatePresence>
                  {openItems.includes('links') && (
                    <motion.div
                      className='mt-2 flex w-full flex-col items-start justify-start gap-2 overflow-hidden'
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DragListItem
                        item={{
                          color: '#f5b75a',
                          name: 'Link',
                          type: 'link_node',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
        <div className='flex flex-col items-center justify-start gap-1'></div>
      </div>
      <ManageFlowsModal
        isOpen={isManageFlowsModalOpen}
        onClose={onCloseManageFlowsModal}
      />
      <CreateFlowModal
        isOpen={isCreateFlowModalOpen}
        onClose={onCloseCreateFlowModal}
      />
    </div>
  )
})

export default SideBar
