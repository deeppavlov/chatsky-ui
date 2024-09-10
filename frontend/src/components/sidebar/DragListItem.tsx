import { GripHorizontal } from "lucide-react";
import React from "react";

const DragListItem = ({ item }: { item: { name: string; color: string; type: string } }) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    // if (event.dataTransfer) {
    event.dataTransfer.setData("application/@xyflow/react", nodeType)
    event.dataTransfer.effectAllowed = "move"
    // }
  }

  return (
    <div
      data-testid={`${item.type}-item`}
      className='drag-list-item'
      onDragStart={(event) => onDragStart(event, item.type)}
      draggable>
      <span
        style={{
          backgroundColor: item.color,
        }}
        className='drag-item-span'></span>
      {item.name}
      <div className='flex items-center justify-center'>
        <GripHorizontal className='stroke-border' />
      </div>
    </div>
  )
}

export default DragListItem
