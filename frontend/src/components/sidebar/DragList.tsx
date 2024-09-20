import DragListItem from "./DragListItem"

export const DragList = () => {

  return (
    <div className='flex flex-col items-start justify-start gap-2 w-full px-0.5'>
      {/* <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Input Node
      </div> */}
      <DragListItem
        item={{
          color: "#1a8bf6",
          name: "Default Node",
          type: "default_node",
        }}
      />
      <DragListItem
        item={{
          color: "var(--foreground)",
          name: "Slots",
          type: "slots_node",
        }}
      />
    </div>
  )
}
