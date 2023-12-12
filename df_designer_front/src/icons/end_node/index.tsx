import React, { forwardRef } from "react";
import { ReactComponent as End_nodeSVG } from "./blue_circle.svg";

export const End_node = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <End_nodeSVG ref={ref} {...props} />;
});
