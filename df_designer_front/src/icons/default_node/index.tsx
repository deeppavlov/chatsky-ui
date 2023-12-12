import React, { forwardRef } from "react";
import { ReactComponent as Default_nodeSVG } from "./blue_circle.svg";

export const Default_node = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <Default_nodeSVG ref={ref} {...props} />;
});
