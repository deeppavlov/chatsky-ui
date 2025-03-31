import {
  Button,
  Checkbox,
  Input,
  //  ModalBody,
  //  ModalFooter,
  //  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { HelpCircle } from 'lucide-react'
import React, { useContext, useState } from 'react'
import { FLOW_COLORS } from '../../consts'
import { flowContext } from '../../contexts/flowContext'
import { ModalType } from '../../types/ModalTypes'
import { generateNewFlow, validateFlowName } from '../../utils'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'

interface CreateFlowModalProps extends ModalType {}

export type CreateFlowType = {
  name: string
  description: string
  color: string
  subflow: string
}

const CreateFlowModal = ({
  isOpen,
  onClose,
  size = '3xl',
}: CreateFlowModalProps) => {
  const { flows, setFlows, saveFlows } = useContext(flowContext)
  const [flow, setFlow] = useState<CreateFlowType>({
    name: '',
    description: '',
    color: '',
    subflow: 'Global',
  })
  const [isSubFlow, setIsSubFlow] = useState(false)
  const [errors, setErrors] = React.useState<{
    name?: { isInvalid: boolean; errorMessage: string }
    color?: { isInvalid: boolean; errorMessage: string }
  }>({})

  const onFlowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlow({
      ...flow,
      [e.target.name]: e.target.value,
    })
    if (validateFlowName(flow.name, flows)) {
      setErrors({
        ...errors,
        [e.target.name]: { isInvalid: false, errorMessage: '' },
      })
    }
  }

  const onColorChange = (color: string) => {
    setFlow({ ...flow, color })
    if (color) {
      setErrors({
        ...errors,
        color: { isInvalid: false, errorMessage: '' },
      })
    }
  }

  const onFlowSave = () => {
    if (!validateFlowName(flow.name, flows)) {
      setErrors({
        ...errors,
        name: { isInvalid: true, errorMessage: 'Flow name is not valid.' },
      })
      return
    }
    if (flow.color && flow.subflow) {
      const newFlow = generateNewFlow(flow)
      setFlows([...flows, newFlow])
      saveFlows([...flows, newFlow])
      setFlow({
        name: '',
        description: '',
        color: '',
        subflow: 'Global',
      })
      setIsSubFlow(false)
      onClose()
    } else {
      setErrors({
        ...errors,
        color: { isInvalid: true, errorMessage: 'Please choose flow color.' },
      })
    }
  }

  return (
    // <ModalComponent
    //  className="bg-background min-h-[584px]"
    //  motionProps={{
    //   initial: { opacity: 0, scale: 0.95 },
    //   animate: { opacity: 1, scale: 1 },
    //  }}
    //  isOpen={true}
    //  onClose={onClose}
    //  size={size}
    // >
    //  <ModalContent>
    //   <ModalHeader>{"Create flow"}</ModalHeader>
    //   <ModalBody >
    //    <div className="grid gap-4">
    //     <Input
    //      data-testid="flow-name-input"
    //      label="Name"
    //      labelPlacement="outside"
    //      placeholder="Enter flow's name here"
    //      name="name"
    //      onChange={onFlowChange}
    //      value={flow.name}
    //      min={2}
    //     />
    //     <Input
    //      label="Description"
    //      labelPlacement="outside"
    //      placeholder="Enter flow's description here"
    //      name="description"
    //      onChange={onFlowChange}
    //      value={flow.description}
    //     />
    //    </div>
    //    <div>
    //     <label className="text-sm font-medium mb-1 block"> Color </label>
    //     <div className="flex items-center gap-2">
    //      {FLOW_COLORS.map((color) => (
    //       <button
    //        data-testid={`flow-color-${color.replace("#", "")}`}
    //        key={color}
    //        onClick={() => setFlow({ ...flow, color })}
    //        className="rounded-full w-8 h-8 transition-all"
    //        style={{
    //         backgroundColor: color,
    //         border: flow.color === color ? "4px solid var(--foreground)" : "none",
    //        }}
    //       ></button>
    //      ))}
    //     </div>
    //    </div>
    //    <div className="grid gap-2">
    //     <div className="flex items-center gap-2">
    //      <label className="text-sm font-medium"> Subflow </label>
    //      <Checkbox
    //       onChange={() => setIsSubFlow(!isSubFlow)}
    //       checked={isSubFlow}
    //      />
    //     </div>
    //     <div
    //      className="grid transition-all z-10"
    //      style={{
    //       gridTemplateRows: isSubFlow ? "1fr" : "0fr",
    //      }}
    //     >
    //      <div className="min-h-0 overflow-hidden">
    //       <Select
    //        classNames={{
    //         listboxWrapper: "max-h-48",
    //         popoverContent: "bg-background",
    //        }}
    //        aria-label="Dependent from"
    //        label="Dependent from"
    //        labelPlacement="outside"
    //        items={flows}
    //        name="subflow"
    //        onChange={(e) => {
    //         if (e.target.value !== "") {
    //          setFlow({ ...flow, subflow: e.target.value });
    //         } else {
    //          setFlow({ ...flow, subflow: "Global" });
    //         }
    //        }}
    //        selectedKeys={[flow.subflow]}
    //       >
    //        {(flow) => <SelectItem key={flow.name}>{flow.name}</SelectItem>}
    //       </Select>
    //      </div>
    //     </div>
    //    </div>
    //   </ModalBody>
    //   <ModalFooter className="flex justify-between items-center">
    //    <div className="flex items-center justify-start gap-2">
    //     <Button isIconOnly className="rounded-full">
    //      <HelpCircle />
    //     </Button>
    //    </div>
    //    <div>
    //     <Button
    //      data-testid="flow-save-btn"
    //      onClick={onFlowSave}
    //      className="bg-foreground text-background"
    //     >
    //      Create flow
    //     </Button>
    //    </div>
    //   </ModalFooter>
    //  </ModalContent>
    // </ModalComponent>

    <Modal
      className='min-h-[584px] bg-background'
      isOpen={isOpen}
      onClose={onClose}
      size={size}
    >
      <ModalHeader>{'Create flow'}</ModalHeader>
      <ModalBody className={'flex min-h-[480px] flex-1 flex-col gap-3 py-2'}>
        <div className='grid gap-4'>
          <Input
            data-testid='flow-name-input'
            label='Name'
            labelPlacement='outside'
            placeholder="Enter flow's name here"
            name='name'
            onChange={onFlowChange}
            value={flow.name}
            min={2}
            variant='bordered'
            {...errors.name}
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
        <label className='mb-1 block text-sm font-medium'> Color </label>
        <div className='flex items-center gap-2'>
          {FLOW_COLORS.map((color) => (
            <button
              data-testid={`flow-color-${color.replace('#', '')}`}
              key={color}
              onClick={() => onColorChange(color)}
              className='h-8 w-8 rounded-full transition-all'
              style={{
                backgroundColor: color,
                border:
                  flow.color === color ? '4px solid var(--foreground)' : 'none',
              }}
            ></button>
          ))}
          {errors.color?.isInvalid && (
            <p className='mt-1 text-sm text-red-500'>
              {errors.color?.errorMessage}
            </p>
          )}
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
            className='z-10 grid transition-all'
            style={{
              gridTemplateRows: isSubFlow ? '1fr' : '0fr',
            }}
          >
            <div className='min-h-0 overflow-hidden'>
              <Select
                classNames={{
                  listboxWrapper: 'max-h-48',
                  popoverContent: 'bg-background',
                }}
                aria-label='Dependent from'
                label='Dependent from'
                labelPlacement='outside'
                items={flows}
                name='subflow'
                onChange={(e) => {
                  if (e.target.value !== '') {
                    setFlow({ ...flow, subflow: e.target.value })
                  } else {
                    setFlow({ ...flow, subflow: 'Global' })
                  }
                }}
                selectedKeys={[flow.subflow]}
              >
                {(flow) => <SelectItem key={flow.name}>{flow.name}</SelectItem>}
              </Select>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className='flex flex-row items-center justify-between'>
        <div className='flex items-center justify-start gap-2'>
          <Button isIconOnly className='rounded-full'>
            <HelpCircle />
          </Button>
        </div>
        <div>
          <Button
            data-testid='flow-save-btn'
            onClick={onFlowSave}
            className='bg-foreground text-background'
          >
            Create flow
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default CreateFlowModal
