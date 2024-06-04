import { useContext, useEffect, useMemo, useState } from "react"
import { DragList } from "./DragList"
import { Accordion, AccordionItem, Button, Divider, useDisclosure } from "@nextui-org/react"
import Header from "../header/Header"
import NodesIcon from "../../icons/sidebar/NodesIcon"
import LinksIcon from "../../icons/sidebar/LinksIcon"
import { Logo } from "../../icons/Logo"
import DragListItem from "./DragListItem"
import { flowContext } from "../../contexts/flowContext"
import classNames from "classnames"
import { useNavigate, useParams } from "react-router-dom"
import { Plus } from "lucide-react"
import CreateFlowModal from "../../modals/FlowModal/CreateFlowModal"
import FlowItem from "./FlowItem"
import ManageFlowsModal from "../../modals/FlowModal/ManageFlowsModal"
import EditNodeIcon from "../../icons/nodes/EditNodeIcon"
import SettingsModal from "../../modals/SettingsModal/SettingsModal"

const SideBar = () => {
  const { flows, getFlows } = useContext(flowContext)
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
  const { flowId } = useParams()
  const activeFlow = useMemo(() => flowId, [flowId])

  const globalFlow = flows.find((flow) => flow.name === "Global")

  return (
    <div className='h-full flex flex-col items-start w-52'>
      <Header />
      <div className='w-full h-full bg-background border-r border-border flex flex-col justify-between px-2 pb-2'>
        <div className='flex flex-col gap-3'>
          <div>
            <div className='flex items-center justify-between'>
              <p className='font-semibold my-4'>Flows</p>
              <div className='flex items-center gap-1.5'>
                <Button
                  onClick={onOpenManageFlowsModal}
                  size='sm'
                  variant='ghost'
                  isIconOnly>
                  <EditNodeIcon fillOpacity={"1"} />
                </Button>
                <Button
                  onClick={onOpenCreateFlowModal}
                  size='sm'
                  variant='ghost'
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
                textValue='some'
                title={
                  <div className='flex items-center justify-start gap-2'>
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
                      type: "link",
                    }}
                  />
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <div className='flex flex-col items-center justify-start gap-1'>
          <Button className='bg-bg-secondary h-max w-full rounded-md py-0.5 text-center text-md font-medium'>
            My storage
          </Button>
          <a
            className='bg-bg-secondary w-full rounded-md py-0.5 flex items-center justify-center gap-2 text-xs'
            href='https://deeppavlov.ai'
            target='_blank'>
            <Logo className='w-4 h-4' />
            df_designer v0.1.0
          </a>
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
}

export default SideBar
