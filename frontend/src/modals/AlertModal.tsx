import { Button } from '@nextui-org/react'; // или заменить на любой другой компонент кнопки
import { useContext } from 'react';
import { PopUpContext } from '../contexts/popUpContext';
import { CustomModalProps, Modal, ModalBody, ModalFooter, ModalHeader } from './ModalComponents';

type AlertModalProps = CustomModalProps & {
  title: string;
  description: string;
  actionText?: string;
  cancelText?: string;
  onAction: () => void;
  onCancel?: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
};

const AlertModal = ({
  id="alert-modal",
  title,
  description,
  actionText = "Confirm",
  cancelText = "Cancel",
  onAction,
  onCancel,
  size = "md",
}: AlertModalProps) => {
  const { closePopUp } = useContext(PopUpContext)

  const onCancelHandler = () => {
    if (onCancel) onCancel()
    closePopUp(id)
  }

  const onActionHandler = () => {
    onAction();
    closePopUp(id)
  }

  return (
    <Modal id={id} size={size} isOpen={true} onClose={onCancelHandler}>
      <ModalHeader>
        <h2 className="text-xl font-bold">{title}</h2>
      </ModalHeader>
      <ModalBody>
        <p>{description}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancelHandler}>
          {cancelText}
        </Button>
        <Button color="danger" onClick={onActionHandler}>
          {actionText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AlertModal;