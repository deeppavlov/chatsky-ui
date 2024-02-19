import { CheckIcon } from 'lucide-react';
import React from 'react';

interface PresetDropdownItemProps {
  preset: string;
  presetHandler: (presetName: string) => void;
  presetName: string;
}

const PresetDropdownItem: React.FC<PresetDropdownItemProps> = ({ preset, presetHandler, presetName }) => {
  return (
    <button
      className={'run-button-option '}
      onClick={(e) => presetHandler(presetName)}
    >
      {presetName.charAt(0).toUpperCase() + presetName.slice(1)} {preset === presetName && <CheckIcon className="h-4 w-4" />}
    </button>
  );
};

export default PresetDropdownItem;