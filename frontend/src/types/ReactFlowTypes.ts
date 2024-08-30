import { Edge } from "@xyflow/react";
import { AppNode } from "./NodeTypes";


export type OnSelectionChangeParamsCustom = {
  nodes: AppNode[]
  edges: Edge[]
}