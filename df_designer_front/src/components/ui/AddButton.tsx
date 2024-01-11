import ShadTooltip from "../ShadTooltipComponent";
import { MouseEventHandler, useContext, useState } from "react";
import { PlusSquare } from "../../icons/PlusSquare";
import { darkContext } from "../../contexts/darkContext";
import { CheckSquare } from "../../icons/CheckSquare";

type Props = {
  tooltipText: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

function AddButton({
  onClick,
  tooltipText,
  disabled = false,
  className,
}: Props) {
  const [isAdded, setIsAdded] = useState(false);
  const click = (e) => {
    onClick(e);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };
  const { dark } = useContext(darkContext);

  const colors = dark
    ? disabled // dark theme
      ? "first:fill-gray-600"
      : "first:fill-text hover:first:fill-status-green"
    : disabled // light theme
    ? "first:fill-gray-400"
    : "first:fill-text hover:first:fill-status-green";

  return (
    <ShadTooltip side="left" content={!isAdded ? tooltipText : "Added!"}>
      <button disabled={disabled} className={className} onClick={click}>
        {!isAdded ? (
          <PlusSquare className={colors} />
        ) : (
          <CheckSquare fill="#0C9" />
        )}
      </button>
    </ShadTooltip>
  );
}

export default AddButton;
