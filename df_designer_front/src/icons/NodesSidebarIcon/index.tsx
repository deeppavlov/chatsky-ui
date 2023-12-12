import React, { forwardRef } from "react";
import { ReactComponent as Nodes_sidebarSVG } from "./nodes_sidebar.svg";

export const Nodes_sidebar = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <Nodes_sidebarSVG ref={ref} {...props} />;
});
