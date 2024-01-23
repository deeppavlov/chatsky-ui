import { ReactNode } from "react";
import { AlertProvider } from "./alertContext";
import { DarkProvider } from "./darkContext";
import { LocationProvider } from "./locationContext";
import PopUpProvider from "./popUpContext";
import { TabsProvider } from "./tabsContext";
import { TypesProvider } from "./typesContext";
import { ReactFlowProvider } from "reactflow";
import { UndoRedoProvider } from "./undoRedoContext";
import { SSEProvider } from "./SSEContext";
import { ChatProvider } from "./chatContext";
import { BuildProvider } from "./buildContext";

export default function ContextWrapper({ children }: { children: ReactNode }) {
  //element to wrap all context
  return (
    <>
      <ReactFlowProvider>
        <DarkProvider>
          <TypesProvider>
            <LocationProvider>
              <AlertProvider>
                <SSEProvider>
                  <BuildProvider>
                    <ChatProvider>
                      <TabsProvider>
                        <UndoRedoProvider>
                          <PopUpProvider>{children}</PopUpProvider>
                        </UndoRedoProvider>
                      </TabsProvider>
                    </ChatProvider>
                  </BuildProvider>
                </SSEProvider>
              </AlertProvider>
            </LocationProvider>
          </TypesProvider>
        </DarkProvider>
      </ReactFlowProvider>
    </>
  );
}
