import { Modal, ModalProps } from '@nextui-org/react'
import { useContext, useEffect } from 'react'
import { workspaceContext } from '../contexts/workspaceContext'


const ModalComponent = ({ ...props }: ModalProps) => {

  const { setMouseOnPane } = useContext(workspaceContext)


  useEffect(() => {
    setMouseOnPane(!props.isOpen!)
  }, [props.isOpen, setMouseOnPane])



  return (
    <Modal {...props}>
      {props.children}
    </Modal>
  )
}

export default ModalComponent