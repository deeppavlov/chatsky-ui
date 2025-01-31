import { Button } from "@nextui-org/react"
import { useContext } from "react"
import { PopUpContext } from "../../contexts/popUpContext"
import { CustomModalProps, Modal, ModalBody, ModalFooter } from "../ModalComponents"
import { Title } from "@radix-ui/react-dialog"
type RestoreBuildModalProps = CustomModalProps & {
  onRestore: () => void
}

const RestoreBuildModal = ({ id = "restore-build-modal", onRestore }: RestoreBuildModalProps) => {
  const { closePopUp } = useContext(PopUpContext)

  const onCancelHandler = () => {
    closePopUp(id)
  }
  const onRestoreHandler = () => {
    onRestore()
    closePopUp(id)
  }

  return (
    <Modal size='sm' className='w-full' id={id} isOpen={true} onClose={onCancelHandler}>
      <div className='flex items-center justify-between pb-4'>
        <Title>
          <h2 className='text-base font-bold'>Are you sure you want to restore an old build?</h2>
        </Title>
      </div>
      <ModalBody>
        <p className='text-sm leading-relaxed'>
          You will get an old version of the graph instead of the current one.
        </p>
      </ModalBody>
      <ModalFooter className='justify-center gap-4'>
        <Button className='flex-grow rounded-lg' onClick={() => closePopUp(id)}>
          Cancel
        </Button>
        <Button
          className='flex-grow bg-foreground text-background rounded-lg'
          color={"default"}
          onClick={onRestoreHandler}
        >
          Confirm
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default RestoreBuildModal
