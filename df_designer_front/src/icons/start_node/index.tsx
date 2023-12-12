import React, { forwardRef } from "react";
import { ReactComponent as Start_nodeSVG } from "./blue_circle.svg";

export const Start_node = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <Start_nodeSVG ref={ref} {...props} />;
});
