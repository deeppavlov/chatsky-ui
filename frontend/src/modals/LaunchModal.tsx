import { buildContext } from "@/contexts/buildContext"
import { flowContext } from "@/contexts/flowContext"
import { PopUpContext } from "@/contexts/popUpContext"
import { runContext } from "@/contexts/runContext"
import DefInput from "@/UI/Input/DefInput"
import { Button } from "@nextui-org/react"
import React, { useContext, useState } from "react"
import { CustomModalProps, Modal, ModalBody, ModalFooter, ModalHeader } from "./ModalComponents"
import { set_tg_token } from "@/api/flows"
import RebuildModal from "./RebuildModal/RebuildModal"
import { checkBuildIsChanged } from "@/api/bot"

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
  const { closePopUp, openPopUp } = useContext(PopUpContext)
  const { flows, saveFlows } = useContext(flowContext)
  const { buildStart, builds } = useContext(buildContext)
  const { runStart, runs } = useContext(runContext)
  const [token, setToken] = useState("")

  const handleConfirmRebuild = () => {
    openPopUp(
      <RebuildModal
        id='rebuild'
        onRebuild={async () => {
          const newBuildName = `Build ${builds.length}`
          const newRunName = `Run ${runs.length}`
          const { status, build_id } = await buildStart({
            end_status: "success",
            messenger: "web",
            preset: "None",
            name: newBuildName,
          })

          if (status === "completed") {
            await runStart(String(build_id), {
              end_status: "success",
              preset: "None",
              name: newRunName,
              build_name: newBuildName,
            })
          }
        }}
      />,
      "rebuild"
    )
  }

  const onActionHandler = async () => {
    onCloseHandler()
    const newBuildName = `Build ${builds.length}`
    const newRunName = `Run ${runs.length}`

    await saveFlows(flows, { interface: "tg" })
    await set_tg_token(token)

    const flowUpdated = await checkBuildIsChanged()

    if (!flowUpdated) {
      handleConfirmRebuild()
      return
    }

    const { status, build_id } = await buildStart({
      end_status: "success",
      messenger: "telegram",
      preset: "None",
      name: newBuildName,
    })

    if (status === "completed") {
      await runStart(String(build_id), {
        end_status: "success",
        preset: "None",
        name: newRunName,
        build_name: newBuildName,
      })
    }
  }

  const onCloseHandler = () => {
    closePopUp(id)
  }

  return (
    <Modal isOpen={true} onClose={onCloseHandler} size='2xl'>
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
