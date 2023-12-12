import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import {
  AccordionComponentType,
  ProgressBarType,
} from "../../types/components";
import { Progress } from "../../components/ui/progress";
import { setInterval } from "timers/promises";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

export default function AccordionComponent({
  trigger,
  children,
  open = [],
}: AccordionComponentType) {
  const [value, setValue] = useState(
    open.length == 0 ? "" : getOpenAccordion(),
  );

  function getOpenAccordion() {
    let value = "";
    open.forEach((el) => {
      if (el == trigger) {
        value = trigger;
      }
    });

    return value;
  }

  function handleClick() {
    value == "" ? setValue(trigger) : setValue("");
  }

  return (
    <>
      <Accordion type="single" value={value} onValueChange={setValue}>
        <AccordionItem value={trigger} className="border-none">
          <AccordionTrigger
            onClick={() => {
              handleClick();
            }}
            className="ml-3"
          >
            {trigger}
          </AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
