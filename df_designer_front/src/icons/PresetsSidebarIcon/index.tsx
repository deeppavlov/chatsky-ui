import React, { forwardRef } from "react";
import { ReactComponent as Presets_sidebarSVG } from "./presets_sidebar.svg";

export const Presets_sidebar = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <Presets_sidebarSVG ref={ref} {...props} />;
});
