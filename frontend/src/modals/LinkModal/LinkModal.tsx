import React, { useContext, useState } from "react"
import { ModalType } from "../../types/ModalTypes"
import { Input, Modal, ModalBody, ModalContent, Select, SelectItem } from "@nextui-org/react"
import { NodeDataType } from "../../types/NodeTypes"
import { flowContext } from "../../contexts/flowContext"

interface LinkModalType extends ModalType {
  data: NodeDataType
}

const LinkModal = ({ isOpen, onClose, size = "3xl", data }: LinkModalType) => {
  const { flows } = useContext(flowContext)
  const [link, setLink] = useState(data)
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink({
      ...link,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Modal
      motionProps={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
      isOpen={isOpen}
      onClose={onClose}
      size={size}>
      <ModalContent>
        <ModalBody>
          <Input
            value={link.name}
            name='name'
            onChange={changeHandler}
          />
          <Select items={flows}>
            {(flow) => <SelectItem key={flow.name}> {flow.name} </SelectItem>}
          </Select>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default LinkModal
