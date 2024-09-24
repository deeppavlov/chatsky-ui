import SlotsGroupsTable from "@/components/nodes/slots/SlotsGroupsTable"
import { flowContext } from "@/contexts/flowContext"
import { Button } from "@nextui-org/react"
import { useReactFlow } from "@xyflow/react"
import { Plus } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { PopUpContext } from "../../contexts/popUpContext"
import EditNodeIcon from "../../icons/nodes/EditNodeIcon"
import { SlotsNodeDataType } from "../../types/NodeTypes"
import DefTextarea from "../../UI/Input/DefTextarea"
import { CustomModalProps, Modal, ModalBody, ModalFooter, ModalHeader } from "../ModalComponents"; // Убедитесь, что путь правильный
import SlotsGroupModal from "./SlotsGroupModal"

type SlotsNodeModalType = CustomModalProps & {
  data: SlotsNodeDataType
  setData: React.Dispatch<React.SetStateAction<SlotsNodeDataType>>
}

const SlotsNodeModal = ({ id = "slots-node-modal", data, setData }: SlotsNodeModalType) => {
  const [nodeData, setNodeData] = useState(data)
  const { updateNodeData } = useReactFlow()
  const { openPopUp, closePopUp } = useContext(PopUpContext)
  const { quietSaveFlows } = useContext(flowContext)

  const [description, setDescription] = useState(nodeData.description ?? "")
  const [groups, setGroups] = useState(nodeData.groups ?? [])

  useEffect(() => {
    setGroups(nodeData.groups)
  }, [nodeData.groups])

  const onSave = () => {
    const newData = {
      ...data,
      description,
      groups,
    }
    setData(() => newData)
    updateNodeData(data.id, newData)
  }

  const handleNewGroupModalOpen = () => {
    openPopUp(
      <SlotsGroupModal
        id='slots-group-modal-create'
        data={nodeData}
        setData={setNodeData}
        group={null}
        is_create={true}
      />,
      "slots-group-modal-create"
    )
  }

  const onSaveHandler = () => {
    onSave()
    quietSaveFlows()
    closePopUp(id)
  }

  const onCloseHandler = () => {
    closePopUp(id)
  }

  return (
    <Modal
      id={id}
      isOpen={true}
      onClose={onCloseHandler}>
      <ModalHeader className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <EditNodeIcon /> Slots Settings
        </div>
      </ModalHeader>
      <ModalBody className='flex flex-col gap-6'>
        <div>
          <label className='block text-xs font-semibold mb-3'>Description</label>
          <DefTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Collect client’s data to fulfil their requests'
          />
        </div>
        <div>
          <label className='block text-xs font-semibold mb-3'>Groups</label>
          <SlotsGroupsTable
            groups={groups}
            setGroups={setGroups}
            nodeData={nodeData}
            setNodeData={setNodeData}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          className='bg-btn-accent text-black'
          onClick={handleNewGroupModalOpen}>
          <Plus className='stroke-black' />
          Add group
        </Button>
        <Button onClick={onSaveHandler}>Save changes</Button>
      </ModalFooter>
    </Modal>
  )
}

export default SlotsNodeModal
