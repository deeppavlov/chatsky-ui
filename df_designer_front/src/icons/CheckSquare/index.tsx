import React from "react";
import { SVGElementInterface } from "../../types/components";

export const CheckSquare = ({ fill, className }: SVGElementInterface) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Frame 2608841">
        <g id="Vector">
          <path
            d="M4.5 8L7 11L11.5 5M15 8C15 14 14 15 8 15C2 15 1 14 1 8C1 2 2 1 8 1C14 1 15 2 15 8Z"
            stroke={fill}
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path
            d="M4.5 8L7 11L11.5 5M15 8C15 14 14 15 8 15C2 15 1 14 1 8C1 2 2 1 8 1C14 1 15 2 15 8Z"
            stroke={fill}
            stroke-opacity="0.15"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </g>
      </g>
    </svg>
  );
};
