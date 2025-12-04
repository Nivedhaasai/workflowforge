import React, { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import NodeCard from './NodeCard'

function SortableItem({ id, node, onClick, onEdit, onDelete }){
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto'
  }
  // pass drag handle props to NodeCard so it can attach to a handle element
  const dragHandleProps = { ...attributes, ...listeners }
  return (
    <div ref={setNodeRef} style={style}>
      <NodeCard node={node} onClick={onClick} onEdit={onEdit} onDelete={onDelete} dragHandleProps={dragHandleProps} />
    </div>
  )
}

export default function NodeList({ nodes = [], onReorder, onSelect, onEdit, onDelete }){
  const [items, setItems] = useState(nodes.map(n=>n.id))
  useEffect(()=> setItems(nodes.map(n=>n.id)), [nodes])

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event){
    const { active, over } = event
    if(!over) return
    if(active.id !== over.id){
      const oldIndex = items.indexOf(active.id)
      const newIndex = items.indexOf(over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      // optimistic reorder: call parent with new ordering
      if(onReorder) onReorder(newItems)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {nodes.map(n=> <SortableItem key={n.id} id={n.id} node={n} onClick={onSelect} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      </SortableContext>
    </DndContext>
  )
}
