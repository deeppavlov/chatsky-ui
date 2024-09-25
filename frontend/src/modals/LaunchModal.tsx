import { buildContext } from "@/contexts/buildContext"
import { flowContext } from "@/contexts/flowContext"
import { PopUpContext } from "@/contexts/popUpContext"
import { runContext } from "@/contexts/runContext"
import DefInput from "@/UI/Input/DefInput"
import { Button } from "@nextui-org/react"
import React, { useContext, useState } from "react"
import { CustomModalProps, Modal, ModalBody, ModalFooter, ModalHeader } from "./ModalComponents"

type LaunchModalProps = CustomModalProps & {
  title?: React.ReactNode
  description?: React.ReactNode
  interface_description?: React.ReactNode
  actionText?: React.ReactNode
}

const LaunchModal = ({
  id = "launch-modal",
  title = "Bot setup",
  description = "",
  interface_description = "Please follow the instructions below to set up your bot interface.",
  actionText = "Launch",
}: LaunchModalProps) => {
  const { closePopUp } = useContext(PopUpContext)
  const { flows, saveFlows } = useContext(flowContext)
  const { buildStart, buildStatus, setBuildStatus } = useContext(buildContext)
  const { runStart } = useContext(runContext)
  const [token, setToken] = useState("")

  const onCloseHandler = () => {
    closePopUp(id)
  }

  const onActionHandler = async () => {
    try {
      saveFlows(flows, { interface: "tg", token })
      onCloseHandler()
      await buildStart({ wait_time: 0, end_status: "success" })
      await runStart({ end_status: "success", wait_time: 0 })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onCloseHandler}
      size='2xl'>
      <ModalHeader>
        <div className='text-xl font-bold'>{title}</div>
      </ModalHeader>
      <ModalBody>
        <div>{description}</div>
        <div className='mb-10'>{interface_description}</div>
        <DefInput
          value={token}
          onValueChange={setToken}
          label='Enter your HTTP API key here'
          labelPlacement='outside'
          placeholder='HTTP API key'
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={onCloseHandler}> Cancel </Button>
        <Button onClick={onActionHandler}>{actionText ?? "Launch"}</Button>
      </ModalFooter>
    </Modal>
  )
}

export default LaunchModal
