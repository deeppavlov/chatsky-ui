import {
 // Modal,
 // ModalBody,
 // ModalContent,
 // ModalFooter,
 // ModalHeader,
 Tab,
 Tabs,
} from "@nextui-org/react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../ModalComponents";
const LocalStorage = ({
 isOpen,
 onClose,
}: {
 isOpen: boolean;
 onClose: () => void;
}) => {
 return (
  // <Modal isOpen={true} onClose={onClose}>
  //  <ModalContent className="min-w-[568px]">
  //   <ModalHeader>Local Storage</ModalHeader>
  //   <ModalBody>
  //    <Tabs
  //     key={"LocalStorageTabs"}
  //     id="LocalStorageTabs"
  //     size="sm"
  //     className=""
  //     classNames={{
  //      cursor: "border border-foreground bg-background",
  //      tab: "w-32 h-8",
  //      panel: "",
  //     }}
  //    >
  //     <Tab
  //      key={"Components"}
  //      title={<span className="flex items-center gap-2">Components</span>}
  //     >
  //      Coming soon...
  //     </Tab>
  //     <Tab
  //      key={"Conditions"}
  //      title={<span className="flex items-center gap-2">Conditions</span>}
  //     >
  //      Coming soon...
  //     </Tab>
  //     <Tab
  //      key={"Slot snippets"}
  //      title={<span className="flex items-center gap-2">Slot snippets</span>}
  //     >
  //      Coming soon...
  //     </Tab>
  //     <Tab
  //      key={"Presets"}
  //      title={<span className="flex items-center gap-2">Presets</span>}
  //     >
  //      Coming soon...
  //     </Tab>
  //    </Tabs>
  //   </ModalBody>
  //   <ModalFooter></ModalFooter>
  //  </ModalContent>
  // </Modal>

  <Modal
   className={"min-h-[208px] pCustom w-auto"}
   isOpen={isOpen}
   onClose={onClose}
  >
   <ModalHeader className="flex py-4 px-6 flex-initial text-large font-semibold">
    Local Storage
   </ModalHeader>
   <ModalBody className="flex flex-1 flex-col gap-3 px-6 py-2">
    <Tabs
     key={"LocalStorageTabs"}
     id="LocalStorageTabs"
     size="sm"
     classNames={{
      cursor: "border border-foreground bg-background",
      tab: "w-32 h-8",
      panel: "",
     }}
    >
     <Tab
      key={"Components"}
      title={<span className="flex items-center gap-2">Components</span>}
     >
      Coming soon...
     </Tab>
     <Tab
      key={"Conditions"}
      title={<span className="flex items-center gap-2">Conditions</span>}
     >
      Coming soon...
     </Tab>
     <Tab
      key={"Slot snippets"}
      title={<span className="flex items-center gap-2">Slot snippets</span>}
     >
      Coming soon...
     </Tab>
     <Tab
      key={"Presets"}
      title={<span className="flex items-center gap-2">Presets</span>}
     >
      Coming soon...
     </Tab>
    </Tabs>
   </ModalBody>
   <ModalFooter className={"flex flex-row gap-2 px-6 py-4 justify-end"}>
    {""}
   </ModalFooter>
  </Modal>
 );
};

export default LocalStorage;
