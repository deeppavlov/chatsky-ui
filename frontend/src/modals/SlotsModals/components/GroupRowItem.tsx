import { Button, TableCell, TableRow, useDisclosure } from "@nextui-org/react"
import NewWindowIcon from "../../../icons/NewWindowIcon"
import TrashIcon from "../../../icons/TrashIcon"
import { SlotsGroupType } from "../../../types/FlowTypes"
import { SlotsNodeDataType } from "../../../types/NodeTypes"

type GroupRowItemProps = {
  group: SlotsGroupType
  data: SlotsNodeDataType
  setData: React.Dispatch<React.SetStateAction<SlotsNodeDataType>>
}

const GroupRowItem = ({ data, setData, group }: GroupRowItemProps) => {
  const { onOpen: onGroupOpen, onClose: onGroupClose, isOpen: isGroupOpen } = useDisclosure()

  return (
    <TableRow key={group.id}>
      <TableCell> </TableCell>
      <TableCell>{group.name}</TableCell>
      <TableCell>
        <ul className='list-disc'>
          {group.slots.slice(0, 3).map((slot, idx) => (
            <>
              {idx === 2 && group.slots.length > 3 ? (
                <li className='text-sm text-gray-400'>+ {group.slots.length - 2} more</li>
              ) : (
                idx === 2 && <li>{slot.name}</li>
              )}
              {idx !== 2 && <li>{slot.name}</li>}
            </>
          ))}
        </ul>
      </TableCell>
      <TableCell>
        <Button
          size='sm'
          isIconOnly
          variant='light'
          color='danger'>
          <TrashIcon />
        </Button>
        <Button
          size='sm'
          isIconOnly
          variant='light'
          color='default'>
          <NewWindowIcon />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default GroupRowItem
