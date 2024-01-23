import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  BoxSelect,
  ClipboardPasteIcon,
  Combine,
  Copy,
  FileText,
  LayoutGrid,
  LucideIcon,
  Settings2,
  Trash2,
} from "lucide-react";

interface ItemProps {
  Icon: LucideIcon;
  text: string;
  hotKey?: string;
}

interface IMenuProps {
  type:
    | "copy"
    | "paste"
    | "toggleGrid"
    | "createPreset"
    | "selectAll"
    | "settings"
    | "doc"
    | "delete";
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  hide?: boolean;
  disabled?: boolean;
}

const items: { [item: string]: ItemProps } = {
  copy: {
    Icon: Copy,
    text: "Copy",
    hotKey: "Ctrl + C",
  },
  paste: {
    Icon: ClipboardPasteIcon,
    text: "Paste",
    hotKey: "Ctrl + V",
  },
  toggleGrid: {
    Icon: LayoutGrid,
    text: "Show/hide grid",
    hotKey: "Shift+G",
  },
  createPreset: {
    Icon: Combine,
    text: "Create preset",
    hotKey: "Ctrl+G",
  },
  selectAll: {
    Icon: BoxSelect,
    text: "Select all",
    hotKey: "Ctrl+A",
  },
  settings: {
    Icon: Settings2,
    text: "Settings",
    hotKey: "",
  },
  doc: {
    Icon: FileText,
    text: "Doc",
    hotKey: "",
  },
  delete: {
    Icon: Trash2,
    text: "Delete",
    hotKey: "Del",
  },
};

export const ContextMenuItem = ({
  type,
  onClick,
  disabled = false,
  hide = false,
}: IMenuProps) => {
  if (hide) return null;

  const { Icon, text, hotKey } = items[type];

  return (
    <ContextMenu.Item
      disabled={disabled}
      onClick={onClick}
      className={`context-item ${disabled && "context-item-disabled"}`}
    >
      <div className="flex flex-row items-center gap-1">
        <Icon className="h-4 w-4" />
        <p>{text}</p>
      </div>
      {hotKey && <span className="text-neutral-400"> {hotKey} </span>}
    </ContextMenu.Item>
  );
};
