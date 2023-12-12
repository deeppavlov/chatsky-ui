import { Node, Edge, Viewport } from "reactflow";
import { NodeType } from "../flow";
//kind and class are just representative names to represent the actual structure of the object received by the API

export type APIObjectType = { kind: APIKindType;[key: string]: APIKindType };
export type APIKindType = { class: APIClassType;[key: string]: APIClassType };
export type APITemplateType = {
  variable: TemplateVariableType;
  [key: string]: TemplateVariableType;
};
export type APIClassType = {
  base_classes: Array<string>;
  description: string;
  template: APITemplateType;
  display_name: string;
  documentation: string;
  pre_responses?: any[]
  pre_transitions?: any[]
  conditions?: ConditionClassType[]
  links?: LinkClassType[]
  from_links?: FromLinkType[]
  nodes?: any[]
  name?: string
  [key: string]: Array<string> | string | APITemplateType | ConditionClassType[] | LinkClassType[] | FromLinkType[] | any[];
};

export type FromLinkType = {
  node: string
  condition: string
}

export type LinkClassType = {
  name: string,
  type: string,
  required: boolean,
  options: any[],
  placeholder: string,
  linkType: string
  to: string
  toName: string
}

export type ConditionClassType = {
  conditionID: number
  required: boolean
  type: string
  left: boolean
  name: string
  priority: number
  transitionType: "default" | "forward" | "backward" | "repeat" | "previous" | "to start" | "to fallback" | string
  intent?: string
  action?: string
  variables?: string
  llm_model?: string
  APIKey?: string
  prompt?: string
}

export type DefaultLinkClassType = {
  LinkID?: string
  display_name: string;
  fromFlow?: string,
  fromNode?: string,
  fromCondition?: string,
  toFlow: string
  toNode?: string
  toCondition?: string
}

export type TemplateVariableType = {
  type: string;
  required: boolean;
  placeholder?: string;
  list: boolean;
  show: boolean;
  multiline?: boolean;
  value?: any;
  api_key?: string
  model_name?: string
  prompt?: string
  quote?: string | string[]
  [key: string]: any;
};
export type sendAllProps = {
  nodes: Node[];
  edges: Edge[];
  name: string;
  description: string;
  viewport: Viewport;
  message: string;

  chatHistory: { message: string; isSend: boolean }[];
};
export type errorsTypeAPI = {
  function: { errors: Array<string> };
  imports: { errors: Array<string> };
};
export type PromptTypeAPI = { input_variables: Array<string> };

export type BuildStatusTypeAPI = {
  built: boolean;
};

export type InitTypeAPI = {
  flowId: string;
};

export type UploadFileTypeAPI = {
  file_path: string;
  flowId: string;
};
