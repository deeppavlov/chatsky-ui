import React, { useState, ChangeEvent, useContext, Dispatch, SetStateAction } from "react";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {  flow_colors } from "../../utils";
import { TabsContext } from "../../contexts/tabsContext";
import { Check } from "lucide-react";
import { FlowType } from "../../types/flow";

type InputProps = {
  currentFlow: FlowType;
  setCurrentFlow: Dispatch<SetStateAction<FlowType>>;
  maxLength?: number;
  flows?: Array<{ id: string; name: string }>;
  tabId?: string;
};

export const EditFlowSettings: React.FC<InputProps> = ({
  currentFlow,
  setCurrentFlow,
  maxLength = 50,
  tabId,
}) => {
  const [isMaxLength, setIsMaxLength] = useState(false);

  const tabs_context = useContext(TabsContext)
  const _flows = tabs_context.flows
  const flow = _flows.find((flow) => flow.id === tabId) ? _flows.find((flow) => flow.id === tabId) : null

  const [activeColor, setActiveColor] = useState(flow ? flow.color : '')


  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length >= maxLength) {
      setIsMaxLength(true);
    } else {
      setIsMaxLength(false);
    }

    setCurrentFlow((prev) => ({ ...prev, name: value }));
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentFlow((prev) => ({ ...prev, description: event.target.value }))
  };

  const handleColorChange = (color: string) => {
    setCurrentFlow((prev) => ({ ...prev, color }))
  }


  return (
    <>
      <Label className="mt-4">
        <div className="edit-flow-arrangement">
          <span className="font-medium">Name</span>{" "}
          {isMaxLength && (
            <span className="edit-flow-span">
              Character limit reached
            </span>
          )}
        </div>
        <Input
          className="mt-2 font-normal"
          onChange={handleNameChange}
          type="text"
          name="name"
          value={currentFlow.name ?? ""}
          placeholder="Flow name"
          id="name"
          maxLength={maxLength}
        />
      </Label>
      <Label className="mt-4">
        <span className="font-medium">Description (optional)</span>
        <Textarea
          name="description"
          id="description"
          onChange={handleDescriptionChange}
          value={currentFlow.description ?? ""}
          placeholder="Flow description"
          className="mt-2 max-h-[100px] font-normal"
          rows={3}
        />
      </Label>
      <Label className="mt-4">
        <span className="font-medium"> Display color </span>
        <div className="flex flex-row gap-4 mt-3">
          {flow_colors.map((color) => {
            return (
              <button
                key={color}
                onClick={e => { setCurrentFlow((prev) => ({ ...prev, color }));
                handleColorChange(color) }}
                style={{backgroundColor: color}}
                className={` flex items-center justify-center w-10 h-10  border  ${currentFlow.color == color && 'border-white scale-110'} rounded-full `}
              >
                { currentFlow.color === color && <Check stroke="white" /> }
              </button>
            )
          })}
        </div>
      </Label>
    </>
  );
};

export default EditFlowSettings;
