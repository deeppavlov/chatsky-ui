import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react"
import { HelpCircle, TrashIcon } from "lucide-react"
import { useContext, useState } from "react"
import toast from "react-hot-toast"
import { FLOW_COLORS } from "../../consts"
import { flowContext } from "../../contexts/flowContext"
import { ModalType } from "../../types/ModalTypes"
import { generateNewFlow, validateFlowName } from "../../utils"

interface CreateFlowModalProps extends ModalType {}

export type CreateFlowType = {
  name: string
  description: string
  color: string
  subflow: string
}

const CreateFlowModal = ({ isOpen, onClose, size = "3xl" }: CreateFlowModalProps) => {
  const { flows, setFlows, saveFlows } = useContext(flowContext)
  const [flow, setFlow] = useState<CreateFlowType>({
    name: "",
    description: "",
    color: "",
    subflow: "Global",
  })
  const [isSubFlow, setIsSubFlow] = useState(false)

  const onFlowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlow({
      ...flow,
      [e.target.name]: e.target.value,
    })
  }

  const onFlowSave = () => {
    if (validateFlowName(flow.name, flows) && flow.color && flow.subflow) {
      const newFlow = generateNewFlow(flow)
      setFlows([...flows, newFlow])
      saveFlows([...flows, newFlow])
      setFlow({
        name: "",
        description: "",
        color: "",
        subflow: "Global",
      })
      setIsSubFlow(false)
      onClose()
    } else {
      toast.error("Please fill all the fields correctly!")
    }
  }

  return (
    <Modal
      className='bg-background min-h-[584px]'
      motionProps={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
      isOpen={isOpen}
      onClose={onClose}
      size={size}>
      <ModalContent>
        <ModalHeader>{"Create flow"}</ModalHeader>
        <ModalBody>
          <div className='grid gap-4'>
            <Input
              data-testid='flow-name-input'
              label='Name'
              labelPlacement='outside'
              placeholder="Enter flow's name here"
              name='name'
              onChange={onFlowChange}
              value={flow.name}
            />
            <Input
              label='Description'
              labelPlacement='outside'
              placeholder="Enter flow's description here"
              name='description'
              onChange={onFlowChange}
              value={flow.description}
            />
          </div>
          <div>
            <label className='text-sm font-medium mb-1 block'> Color </label>
            <div className='flex items-center gap-2'>
              {FLOW_COLORS.map((color) => (
                <button
                  data-testid={`flow-color-${color.replace("#", "")}`}
                  key={color}
                  onClick={() => setFlow({ ...flow, color })}
                  className='rounded-full w-8 h-8 transition-all'
                  style={{
                    backgroundColor: color,
                    border: flow.color === color ? "4px solid white" : "none",
                  }}></button>
              ))}
            </div>
          </div>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'> Subflow </label>
              <Checkbox
                onChange={() => setIsSubFlow(!isSubFlow)}
                checked={isSubFlow}
              />
            </div>
            <div
              className='grid transition-all z-10'
              style={{
                gridTemplateRows: isSubFlow ? "1fr" : "0fr",
              }}>
              <div className='min-h-0 overflow-hidden'>
                <Select
                  classNames={{
                    listboxWrapper: "max-h-48",
                    popoverContent: "bg-background",
                  }}
                  aria-label='Dependent from'
                  label='Dependent from'
                  labelPlacement='outside'
                  items={flows}
                  name='subflow'
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      setFlow({ ...flow, subflow: e.target.value })
                    } else {
                      setFlow({ ...flow, subflow: "Global" })
                    }
                  }}
                  selectedKeys={[flow.subflow]}>
                  {(flow) => <SelectItem key={flow.name}>{flow.name}</SelectItem>}
                </Select>
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
              className='hover:bg-red-500'
              isIconOnly>
              <TrashIcon />
            </Button>
          </div>
          <div>
            <Button
              data-testid='flow-save-btn'
              onClick={onFlowSave}
              className='bg-foreground text-background'>
              Create flow
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateFlowModal
