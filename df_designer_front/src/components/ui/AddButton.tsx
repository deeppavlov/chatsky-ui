import ShadTooltip from "../ShadTooltipComponent";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  MouseEventHandler,
  useContext,
  useState,
} from "react";
import { PlusSquare } from "../../icons/PlusSquare";
import { darkContext } from "../../contexts/darkContext";
import { CheckSquare } from "../../icons/CheckSquare";

type Props = {
  tooltipText: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  isAdded: boolean;
  className?: string;
};

function AddButton({ onClick, tooltipText, className, isAdded }: Props) {
  const { dark } = useContext(darkContext);

  const colors = dark
    ? "first:fill-gray-400 hover:first:fill-status-green"
    : "first:fill-gray-500 hover:first:fill-status-green";

  return (
    <ShadTooltip side="top" content={!isAdded ? tooltipText : "Added!"}>
      <button className={className} onClick={onClick}>
        {!isAdded ? (
          <PlusSquare className={colors} />
        ) : (
          <CheckSquare className={colors} />
        )}
      </button>
    </ShadTooltip>
  );
}

export default AddButton;
