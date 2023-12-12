import React, { forwardRef } from "react";
import { ReactComponent as Links_SVG } from "./links.svg";

export const Links_ = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <Links_SVG ref={ref} {...props} />;
});
