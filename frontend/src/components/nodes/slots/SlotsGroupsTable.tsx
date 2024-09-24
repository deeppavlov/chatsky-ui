import { PopUpContext } from "@/contexts/popUpContext"
import DocumentationIcon from "@/icons/DocumentationIcon"
import NewWindowIcon from "@/icons/NewWindowIcon"
import TrashIcon from "@/icons/TrashIcon"
import AlertModal from "@/modals/AlertModal"
import SlotsGroupModal from "@/modals/SlotsModals/SlotsGroupModal"
import { SlotsGroupType } from "@/types/FlowTypes"
import { SlotsNodeDataType } from "@/types/NodeTypes"
import DefTable from "@/UI/Table/DefTable"
import { Button, Divider, TableCell, TableRow } from "@nextui-org/react"
import React, { Fragment, useContext } from "react"

type Props = {
  groups: SlotsGroupType[]
  setGroups: React.Dispatch<React.SetStateAction<SlotsGroupType[]>>
  nodeData: SlotsNodeDataType
  setNodeData: React.Dispatch<React.SetStateAction<SlotsNodeDataType>>
  onDeleteGroupHandler?: (group: SlotsGroupType, updatedGroups: SlotsGroupType[]) => void
}

const SlotsGroupsTable = ({
  groups,
  setGroups,
  nodeData,
  setNodeData,
  onDeleteGroupHandler = () => {},
}: Props) => {
  const { openPopUp } = useContext(PopUpContext)

  const handleDeleteGroup = (group: SlotsGroupType) => {
    // Удаление группы
    openPopUp(
      <AlertModal
        size={"lg"}
        id={`delete-group-modal-${group.id}`}
        title='Delete group'
        description={`Are you sure you want to delete "${group.name}" group?`}
        onAction={() => {
          const updatedGroups = nodeData.groups.filter((g) => g.id !== group.id)
          setGroups(updatedGroups)
          onDeleteGroupHandler(group, updatedGroups)
        }}
        actionText='Delete'
      />,
      `delete-group-modal-${group.id}`
    )
  }

  const handleGroupModalOpen = (group: SlotsGroupType) => {
    openPopUp(
      <SlotsGroupModal
        id={`slots-group-modal-edit-${group.id}`}
        data={nodeData}
        setData={setNodeData}
        group={group}
        is_create={false}
      />,
      `slots-group-modal-edit-${group.id}`
    )
  }

  return (
    <DefTable headers={[" ", "name", "contains slots", "actions"]}>
      {groups.map((group) => (
        <TableRow key={group.id}>
          <TableCell> </TableCell>
          <TableCell>{group.name}</TableCell>
          <TableCell>
            <div className='flex flex-col'>
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
              {group.subgroups && group.subgroups.length > 0 && (
                <>
                  <Divider
                    orientation='horizontal'
                    className='my-1'
                  />
                  <ul>
                    {group.subgroups.map((s) => {
                      const subgroup = nodeData.groups.find((g) => g.id === s)
                      if (subgroup) {
                        return (
                          <li
                            key={subgroup.id}
                            className='text-sm flex items-center gap-1'>
                            <DocumentationIcon />
                            {subgroup.name}
                          </li>
                        )
                      } else {
                        return <></>
                      }
                    })}
                  </ul>
                </>
              )}
            </div>
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
  )
}

export default SlotsGroupsTable
