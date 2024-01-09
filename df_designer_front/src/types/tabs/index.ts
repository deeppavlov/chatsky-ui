import { Dispatch, SetStateAction } from "react";
import { FlowType, NodeType } from "../flow";

export type TabsContextType = {
  targetNode: NodeType | null;
  setTargetNode: (state: NodeType) => void;
  saveFlow: (flow: FlowType) => Promise<void>;
  save: () => void;
  tabId: string;
  setTabId: (index: string) => void;
  flows: Array<FlowType>;
  removeFlow: (id: string) => void;
  addFlow: (flowData?: FlowType, newProject?: boolean, newFlowData?: any) => Promise<String>;
  updateFlow: (newFlow: FlowType) => void;
  incrementNodeId: () => string;
  downloadFlow: (
    flow: FlowType,
    flowName: string,
    flowDescription?: string
  ) => void;
  downloadFlows: () => void;
  uploadFlows: () => void;
  uploadFlow: (newFlow?: boolean) => void;
  hardReset: () => void;
  //disable CopyPaste
  disableCopyPaste: boolean;
  setDisableCopyPaste: (value: boolean) => void;
  managerMode: boolean,
  setManagerMode: (state: boolean) => void,
  flowMode: boolean,
  setFlowMode: (state: boolean) => void,
  getNodeId: (nodeType: string) => string;
  tabsState: TabsState;
  setTabsState: Dispatch<SetStateAction<TabsState>>;
  paste: (
    selection: { nodes: any; edges: any },
    position: { x: number; y: number; paneX?: number; paneY?: number },
  ) => void;
  lastCopiedSelection: { nodes: any; edges: any };
  setLastCopiedSelection: (selection: { nodes: any; edges: any }) => void;
  setTweak: (tweak: any) => void;
  getTweak: any;
  lastSelection: { nodes: any[], edges: any[] }
  setLastSelection: (selection: { nodes: any; edges: any }) => void;
  goToNodeHandler: (currFlow: FlowType, currNodeId: string) => void;
};

export type TabsState = {
  [key: string]: {
    isPending: boolean;
  };
};
