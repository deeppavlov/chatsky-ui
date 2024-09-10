import {
  Button,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react"
import { HelpCircle, TrashIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ModalComponent from "../../components/ModalComponent"
import { FLOW_COLORS } from "../../consts"
import { flowContext } from "../../contexts/flowContext"
import { NotificationsContext } from "../../contexts/notificationsContext"
import { FlowType } from "../../types/FlowTypes"
import { ModalType } from "../../types/ModalTypes"
import { validateFlowName } from "../../utils"

interface CreateFlowModalProps extends ModalType {}

export type CreateFlowType = {
  name: string
  description: string
  color: string
  subflow: string
}

const ManageFlowsModal = ({ isOpen, onClose, size = "3xl" }: CreateFlowModalProps) => {
  const { flows, setFlows, saveFlows } = useContext(flowContext)
  const { notification: n } = useContext(NotificationsContext)
  const [newFlows, setNewFlows] = useState<FlowType[]>([...flows] ?? [])
  const { flowId } = useParams()
  const [flow, setFlow] = useState<FlowType>(
    newFlows.find((_flow) => _flow.name === flowId) ?? [][0]
  )
  const navigate = useNavigate()
  const [newFlow, setNewFlow] = useState<FlowType>(flow)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSubFlow, setIsSubFlow] = useState(false)
  const [isGlobal, setIsGlobal] = useState(false)

  useEffect(() => {
    setNewFlows(() => [...flows])
  }, [flows, isOpen])

  useEffect(() => {
    setFlow(() => newFlows.find((_flow) => _flow.name === flowId) ?? [][0])
    setNewFlow(() => newFlows.find((_flow) => _flow.name === flowId) ?? [][0])

    if (flowId === "Global") {
      setIsGlobal(true)
    }
  }, [flowId, newFlows, isOpen])

  const onFlowSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setFlow(() => newFlows.find((_flow) => _flow.name === e.target.name) ?? [][0])
  }

  useEffect(() => {
    if (flow) {
      setNewFlow(flow)
      if (flow.name === "Global") {
        setIsGlobal(true)
      } else {
        setIsGlobal(false)
      }
    }
  }, [flow])

  const onFlowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFlow({
      ...newFlow,
      [e.target.name]: e.target.value,
    })
  }

  const onFlowSave = () => {
    if (!validateFlowName(newFlow.name, newFlows) && newFlow.name !== flow.name) {
      return n.add({
        title: "Warning!",
        message: "Flow name is not valid.",
        type: "warning",
      })
    }
    if (newFlow.color && newFlow.subflow) {
      setFlows([...newFlows.map((_flow) => (_flow.id === flow.id ? newFlow : _flow))])
      saveFlows([...newFlows.map((_flow) => (_flow.id === flow.id ? newFlow : _flow))])
      setIsSubFlow(false)
      onClose()
    } else {
      n.add({
        title: "Warning!",
        message: "Please fill all the fields correctly.",
        type: "warning",
      })
    }
  }

  const onFlowDelete = () => {
    if (newFlow.name === "Global") {
      return n.add({
        title: "Warning!",
        message: "Global flow cannot be deleted.",
        type: "warning",
      })
    } else {
      if (flowId === newFlow.name) {
        navigate('/app/home')
      }
      setFlows([...newFlows.filter((_flow) => _flow.name !== newFlow.name)])
      saveFlows([...newFlows.filter((_flow) => _flow.name !== newFlow.name)])
    }
  }

  return (
    <ModalComponent
      className='bg-background min-h-[584px]'
      motionProps={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
      isOpen={isOpen}
      onClose={onClose}
      size={size}>
      {flow && (
        <ModalContent>
          <ModalHeader>{"Manage flows"}</ModalHeader>
          <ModalBody>
            <div className='grid grid-cols-4 gap-8'>
              <div className='col-span-1 flex flex-col items-start justify-start'>
                {newFlows.map((_flow) => (
                  <button
                    className='w-full p-1 rounded-lg cursor-pointer text-start'
                    style={{
                      backgroundColor:
                        _flow.name === flow.name ? "var(--border)" : "var(--background)",
                    }}
                    key={_flow.name}
                    name={_flow.name}
                    onClick={onFlowSelect}>
                    {_flow.name}
                  </button>
                ))}
              </div>
              <div className='col-span-3'>
                <div className='grid gap-4'>
                  <Input
                    disabled={isGlobal}
                    label='Name'
                    labelPlacement='outside'
                    placeholder="Enter flow's name here"
                    name='name'
                    onChange={onFlowChange}
                    value={newFlow.name}
                    min={2}
                  />
                  <Input
                    disabled={isGlobal}
                    label='Description'
                    labelPlacement='outside'
                    placeholder="Enter flow's description here"
                    name='description'
                    onChange={onFlowChange}
                    value={newFlow.description}
                  />
                </div>
                <div className='mt-4'>
                  <label className='text-sm font-medium mb-1 block'> Color </label>
                  <div className='flex items-center gap-2'>
                    {FLOW_COLORS.map((color) => (
                      <button
                        disabled={isGlobal}
                        key={color}
                        onClick={() => setNewFlow({ ...newFlow, color })}
                        className='rounded-full w-8 h-8 transition-all'
                        style={{
                          backgroundColor: color,
                          border: newFlow.color === color ? "4px solid var(--foreground)" : "none",
                        }}></button>
                    ))}
                  </div>
                </div>
                <div className='grid gap-2'>
                  {/* <div className='flex items-center gap-2'>
                    <label className='text-sm font-medium'> Subflow </label>
                    <Checkbox
                      onChange={() => setIsSubFlow(!isSubFlow)}
                      checked={isSubFlow}
                    />
                  </div> */}
                  <div
                    className='grid transition-all'
                    style={{
                      gridTemplateRows: "1fr",
                    }}>
                    <div className='min-h-0 overflow-hidden mt-4'>
                      <Select
                        disabled={isGlobal}
                        aria-label='Dependent from'
                        label='Dependent from'
                        labelPlacement='outside'
                        items={newFlows}
                        disabledKeys={isGlobal ? [...newFlows.map((_flow) => _flow.name)] : []}
                        classNames={{
                          listboxWrapper: "max-h-48",
                          popoverContent: "bg-background",
                        }}
                        name='subflow'
                        onChange={(e) => {
                          if (e.target.value !== "") {
                            setNewFlow({ ...newFlow, subflow: e.target.value })
                          } else {
                            setNewFlow({ ...newFlow, subflow: "Global" })
                          }
                        }}
                        selectedKeys={newFlow.subflow ? [newFlow.subflow] : []}>
                        {(flow) => <SelectItem key={flow.name}>{flow.name}</SelectItem>}
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className='flex justify-between items-center'>
            <div className='flex items-center justify-start gap-2'>
              <Button
                isIconOnly
                className='rounded-full'>
                <HelpCircle />
              </Button>
              <Button
                onClick={onFlowDelete}
                className='hover:bg-red-500'
                isIconOnly>
                <TrashIcon />
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                onClick={onClose}
                variant='ghost'>
                Cancel
              </Button>
              <Button
                onClick={onFlowSave}
                className='bg-foreground text-background'>
                Save flow
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      )}
    </ModalComponent>
  )
}

export default ManageFlowsModal
