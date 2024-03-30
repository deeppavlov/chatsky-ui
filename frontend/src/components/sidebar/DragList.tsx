import React from "react"
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
          color: "#00cc99",
          name: "Start Node",
          type: "start_node",
        }}
      />
      <DragListItem item={{
        color: "#ff3434",
        name: "Fallback Node",
        type: "fallback_node",
      }} />
      {/* <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Node
      </div> */}
    </div>
  )
}
