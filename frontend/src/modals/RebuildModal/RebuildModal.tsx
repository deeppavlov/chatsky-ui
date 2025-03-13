import { Button } from '@nextui-org/react'
import { useContext } from 'react'
import { PopUpContext } from '../../contexts/popUpContext'
import {
  CustomModalProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../ModalComponents'

type RebuildModalProps = CustomModalProps & {
  onRebuild: () => void
}

const RebuildModal = ({ id = 'alert-modal', onRebuild }: RebuildModalProps) => {
  const { closePopUp } = useContext(PopUpContext)

  const onCancelHandler = () => {
    closePopUp(id)
  }
  const onRebuildHandler = () => {
    onRebuild()
    closePopUp(id)
  }

  return (
    <Modal
      className='w-full max-w-[364px]'
      id={id}
      isOpen={true}
      onClose={onCancelHandler}
    >
      <ModalHeader>
        <div className='text-base font-bold'>
          You already have active build and run
        </div>
      </ModalHeader>
      <ModalBody>
        <p className='text-sm leading-relaxed'>
          The project has not changed since the last build, and a new build will
          be identical to the current one. Would you like to rebuild it anyway?
        </p>
      </ModalBody>
      <ModalFooter className='justify-center gap-4'>
        <Button className='flex-grow' onClick={onRebuildHandler}>
          Rebuild
        </Button>
        <Button
          className='flex-grow bg-foreground text-background'
          color={'default'}
          onClick={onCancelHandler}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default RebuildModal
