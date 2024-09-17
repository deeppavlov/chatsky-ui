import { Accordion, AccordionItem, Button, Divider, useDisclosure } from "@nextui-org/react"
import { Plus } from "lucide-react"
import { memo, useContext, useMemo } from "react"
import { useParams } from "react-router-dom"
import { flowContext } from "../../contexts/flowContext"
import EditNodeIcon from "../../icons/nodes/EditNodeIcon"
import LinksIcon from "../../icons/sidebar/LinksIcon"
import NodesIcon from "../../icons/sidebar/NodesIcon"
import CreateFlowModal from "../../modals/FlowModal/CreateFlowModal"
import ManageFlowsModal from "../../modals/FlowModal/ManageFlowsModal"
import Header from "../header/Header"
import { DragList } from "./DragList"
import DragListItem from "./DragListItem"
import FlowItem from "./FlowItem"

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
  const globalFlow = useMemo(() => flows.find((flow) => flow.name === "Global"), [flows])

  return (
    <div
      data-testid='sidebar'
      className='h-full flex flex-col items-start w-52'>
      <Header />
      <div className='w-full h-full bg-background border-r border-border flex flex-col justify-between px-2 pb-14'>
        <div className='flex flex-col gap-3'>
          <div>
            <div
              data-testid='flows-list'
              className='flex items-center justify-between'>
              <p className='font-semibold my-4'>Flows</p>
              <div className='flex items-center gap-1.5'>
                <Button
                  className='border-1'
                  onClick={onOpenManageFlowsModal}
                  size='sm'
                  variant='bordered'
                  isIconOnly>
                  <EditNodeIcon fillOpacity={"1"} />
                </Button>
                <Button
                  className='border-1'
                  onClick={onOpenCreateFlowModal}
                  size='sm'
                  variant='bordered'
                  isIconOnly>
                  <Plus />
                </Button>
              </div>
            </div>
            <div className='w-full flex flex-col items-start justify-start gap-0.5 mb-2'>
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
          <div>
            <p className='font-semibold mb-4'>Available components</p>
            <Accordion
              className='flex flex-col gap-2 px-0'
              showDivider={false}
              itemClasses={{
                base: "bg-transparent",
                content: "bg-background mt-1",
                trigger: "bg-transparent p-2",
                heading: "bg-bg-secondary rounded-lg border border-border",
                indicator: "bg-transparent",
                startContent: "bg-transparent",
                subtitle: "bg-transparent",
                title: "bg-transparent rounded-lg",
                titleWrapper: "bg-transparent",
              }}
              isCompact
              selectionMode='multiple'>
              <AccordionItem
                name='nodes'
                data-testid='nodes-collapse'
                textValue='some'
                title={
                  <div
                    data-testid='nodes-collapse-btn'
                    className='flex items-center justify-start gap-2'>
                    <NodesIcon />
                    Nodes
                  </div>
                }>
                <DragList />
              </AccordionItem>
              <AccordionItem
                textValue='some'
                title={
                  <div className='flex items-center justify-start gap-2'>
                    <LinksIcon />
                    Links
                  </div>
                }>
                <div className='flex flex-col items-start justify-start gap-2 w-full'>
                  <DragListItem
                    item={{
                      color: "#f5b75a",
                      name: "Link",
                      type: "link_node",
                    }}
                  />
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <div className='flex flex-col items-center justify-start gap-1'>
        </div>
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
