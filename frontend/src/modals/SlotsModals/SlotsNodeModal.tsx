import { Button, TableCell, TableRow } from "@nextui-org/react"
import { useReactFlow } from "@xyflow/react"
import { Plus } from "lucide-react"
import { Fragment, useContext, useEffect, useState } from "react"
import { PopUpContext } from "../../contexts/popUpContext"
import NewWindowIcon from "../../icons/NewWindowIcon"
import EditNodeIcon from "../../icons/nodes/EditNodeIcon"
import TrashIcon from "../../icons/TrashIcon"
import { SlotsGroupType } from "../../types/FlowTypes"
import { SlotsNodeDataType } from "../../types/NodeTypes"
import DefTextarea from "../../UI/Input/DefTextarea"
import DefTable from "../../UI/Table/DefTable"
import AlertModal from "../AlertModal"
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

  const handleDeleteGroup = (group: SlotsGroupType) => {
    // Удаление группы
    openPopUp(
      <AlertModal
        size={"lg"}
        id='delete-group-modal'
        title='Delete group'
        description={`Are you sure you want to delete "${group.name}" group?`}
        onAction={() => {
          const updatedGroups = nodeData.groups.filter((g) => g.id !== group.id)
          setGroups(updatedGroups)
        }}
        actionText='Delete'
      />,
      "delete-group-modal"
    )
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

  const handleGroupModalOpen = (group: SlotsGroupType) => {
    openPopUp(
      <SlotsGroupModal
        id='slots-group-modal-edit'
        data={nodeData}
        setData={setNodeData}
        group={group}
        is_create={false}
      />,
      "slots-group-modal-edit"
    )
  }

  const onSaveHandler = () => {
    onSave()
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
          <DefTable headers={[" ", "name", "contains slots", "actions"]}>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell> </TableCell>
                <TableCell>{group.name}</TableCell>
                <TableCell>
                  <ul className='list-disc'>
                    {group.slots.slice(0, 3).map((slot, idx) => (
                      <Fragment key={slot.id}>
                        {idx === 2 && group.slots.length > 3 ? (
                          <li className='text-sm text-gray-400'>+ {group.slots.length - 2} more</li>
                        ) : (
                          idx === 2 && <li>{slot.name}</li>
                        )}
                        {idx !== 2 && <li>{slot.name}</li>}
                      </Fragment>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDeleteGroup(group)}
                    size='sm'
                    isIconOnly
                    variant='light'
                    color='danger'>
                    <TrashIcon />
                  </Button>
                  <Button
                    onClick={() => handleGroupModalOpen(group)}
                    size='sm'
                    isIconOnly
                    variant='light'
                    color='default'>
                    <NewWindowIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DefTable>
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
