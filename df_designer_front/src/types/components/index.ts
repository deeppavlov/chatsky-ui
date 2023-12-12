import { ReactElement, ReactNode } from "react";
import { FlowType, NodeDataType, NodeType } from "../flow/index";
import { typesContextType } from "../typesContext";

export type SVGElementInterface = {
  className?: string
  width?: string
  height?: string
  viewbox?: string
  fill?: string
  pathClassName?: string
  strokeWidth?: number
  stroke?: string
}

export type InputComponentType = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  password: boolean;
  disableCopyPaste?: boolean;
  editNode?: boolean;
  onChangePass?: (value: boolean | boolean) => void;
  showPass?: boolean;
  className?: string;
  placeholder?: string;
};
export type ToggleComponentType = {
  className?: string
  enabled: boolean;
  setEnabled: (state: boolean) => void;
  disabled: boolean;
  size: "small" | "medium" | "large";
};
export type DropDownComponentType = {
  value: string | ReactNode;
  options: string[] | ReactNode[];
  onSelect: (value: string | ReactNode | any) => void;
  editNode?: boolean;
  apiModal?: boolean;
  numberOfOptions?: number;
};
export type ParameterComponentType = {
  data: NodeDataType;
  title: string;
  id: string;
  color: string;
  left: boolean;
  type: string;
  required?: boolean;
  name?: string;
  tooltipTitle: string;
  dataContext?: typesContextType;
  info?: string;
  priority?: number
  conditionID?: number
  transitionType?: string
};
export type InputListComponentType = {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  editNode?: boolean;
  onAddInput?: (value?: string[]) => void;
};

export type TextAreaComponentType = {
  disabled: boolean;
  onChange: (value: string[] | string) => void;
  value: string;
  editNode?: boolean;
};

export type FileComponentType = {
  disabled: boolean;
  onChange: (value: string[] | string) => void;
  value: string;
  suffixes: Array<string>;
  fileTypes: Array<string>;
  onFileChange: (value: string) => void;
  editNode?: boolean;
};

export type DisclosureComponentType = {
  children: ReactNode;
  openDisc: boolean;
  button: {
    title: string;
    Icon: any;
    buttons?: {
      Icon: ReactElement;
      title: string;
      onClick: (event?: React.MouseEvent) => void;
    }[];
  };
};
export type FloatComponentType = {
  value: string;
  disabled?: boolean;
  disableCopyPaste?: boolean;
  onChange: (value: string) => void;
  editNode?: boolean;
};

export type TooltipComponentType = {
  children: ReactElement;
  title: string | ReactElement;
  placement?:
  | "bottom-end"
  | "bottom-start"
  | "bottom"
  | "left-end"
  | "left-start"
  | "left"
  | "right-end"
  | "right-start"
  | "right"
  | "top-end"
  | "top-start"
  | "top";
};

export type ProgressBarType = {
  children?: ReactElement;
  value?: number;
  max?: number;
};

export type RadialProgressType = {
  value?: number;
  color?: string;
};

export type AccordionComponentType = {
  children?: ReactElement;
  open?: string[];
  trigger?: string;
};
export type Side = "top" | "right" | "bottom" | "left";

export type ShadTooltipProps = {
  delayDuration?: number;
  side?: Side;
  content: ReactNode;
  children: ReactNode;
};

export type FilterNodesType = {
  flow: FlowType
  filteredNodes: NodeType[]
}