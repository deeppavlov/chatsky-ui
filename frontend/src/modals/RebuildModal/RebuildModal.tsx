import { Button } from "@nextui-org/react"
import { useContext } from "react"
import { PopUpContext } from "../../contexts/popUpContext"
import { CustomModalProps, Modal, ModalBody, ModalFooter, ModalHeader } from "../ModalComponents"

type RebuildModalProps = CustomModalProps & {
  onRebuild: () => void
  onNewRun: () => void
}

const RebuildModal = ({ id = "alert-modal", onRebuild, onNewRun }: RebuildModalProps) => {
  const { closePopUp } = useContext(PopUpContext)

  const onCancelHandler = () => {
    closePopUp(id)
  }
  const onRebuildHandler = () => {
    onRebuild()
    closePopUp(id)
  }

  const onNewRunHandler = () => {
    onNewRun()
    closePopUp(id)
  }

  return (
    <Modal className='w-full max-w-[364px]' id={id} isOpen={true} onClose={onCancelHandler}>
      <ModalHeader>
        <h2 className='text-base font-bold'>Do you want to run on current build?</h2>
      </ModalHeader>
      <ModalBody>
        <p className='text-sm leading-relaxed'>
          The project has not changed since the last build. Would you like to rebuild it or to run
          on the current build?
        </p>
      </ModalBody>
      <ModalFooter className='justify-center gap-4'>
        <Button className='flex-grow' onClick={onRebuildHandler}>
          Rebuild
        </Button>
        <Button
          className='flex-grow bg-foreground text-background'
          color={"default"}
          onClick={onNewRunHandler}
        >
          New run
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default RebuildModal
