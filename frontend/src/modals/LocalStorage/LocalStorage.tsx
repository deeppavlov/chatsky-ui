import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
} from "@nextui-org/react"
import React from "react"

const LocalStorage = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}>
      <ModalContent className='min-w-[568px]'>
        <ModalHeader>Local Storage</ModalHeader>
        <ModalBody>
          <Tabs
            key={"LocalStorageTabs"}
            id='LocalStorageTabs'
            size='sm'
            className=''
            classNames={{
              cursor: "border border-foreground bg-background",
              tab: "w-32 h-8",
              panel: "",
            }}>
            <Tab
              key={"Components"}
              title={<span className='flex items-center gap-2'>Components</span>}>
              Coming soon...
            </Tab>
            <Tab
              key={"Conditions"}
              title={<span className='flex items-center gap-2'>Conditions</span>}>
              Coming soon...
            </Tab>
            <Tab
              key={"Slot snippets"}
              title={<span className='flex items-center gap-2'>Slot snippets</span>}>
              Coming soon...
            </Tab>
            <Tab
              key={"Presets"}
              title={<span className='flex items-center gap-2'>Presets</span>}>
              Coming soon...
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LocalStorage
