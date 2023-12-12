import React, { forwardRef } from "react";
import { ReactComponent as LLM_nodeSVG } from "./blue_circle.svg";

export const LLM_node = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <LLM_nodeSVG ref={ref} {...props} />;
});
