import { PopUpContext } from '@/contexts/popUpContext'
import { Button } from '@nextui-org/react'
import { useContext } from 'react'
import {
  CustomModalProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../ModalComponents'

interface ConfirmationModalProps extends CustomModalProps {
  title: string
  bodyText: string
  onAction: (e: React.MouseEvent) => void
}

const ConfirmationModal = ({
  id = 'confirmation-modal',
  title,
  bodyText,
  onClose,
  onAction,
}: ConfirmationModalProps) => {
  const { closePopUp } = useContext(PopUpContext)

  const onCancelHandler = () => {
    closePopUp(id)
    onClose && onClose()
  }

  const onActionHandler = (e: React.MouseEvent) => {
    onAction(e)
    closePopUp(id)
  }

  return (
    <Modal
      id={id}
      className='w-full max-w-[368px] bg-background pt-[16px]'
      isOpen={true}
      onClose={onCancelHandler}
    >
      <ModalHeader className='text-base font-bold' showCloseButton={false}>
        {title}
      </ModalHeader>
      <ModalBody className={'flex flex-1 flex-col gap-3'}>
        <p className='text-sm leading-relaxed'>{bodyText}</p>
      </ModalBody>
      <ModalFooter className='flex flex-row items-center justify-between'>
        <div className='flex w-full justify-between'>
          <Button
            className='h-[40px] w-[152px] rounded-[10px]'
            onClick={onCancelHandler}
          >
            Cancel
          </Button>
          <Button
            className='h-[40px] w-[152px] rounded-[10px] bg-black text-white'
            onClick={onActionHandler}
          >
            Delete
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default ConfirmationModal
