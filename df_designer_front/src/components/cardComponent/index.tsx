import { Trash2, ExternalLink } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { TabsContext } from "../../contexts/tabsContext";
import { FlowType } from "../../types/flow";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { gradients } from "../../utils";
import {
  CardTitle,
  CardDescription,
  CardFooter,
  Card,
  CardHeader,
} from "../ui/card";




export const CardComponent = ({
  flow,
  id,
  onDelete,
  button,
}: {
  flow: FlowType;
  id: string;
  onDelete?: () => void;
  button?: JSX.Element;
}) => {
  const { removeFlow } = useContext(TabsContext);

  return (
    <AlertDialog.Root>
      <Card className="group">
        <CardHeader>
          <CardTitle className="card-component-title-display">
            <span
              className={
                "card-component-image "
              }
              style={{ backgroundColor: flow.color }}
            ></span>
            <span className="card-component-title-size">
              {flow.name}
            </span>
            {onDelete && (
              <AlertDialog.Trigger className={'card-component-delete-button'}>
                {/* <button className="card-component-delete-button" onClick={() => { }}> */}
                <Trash2 className="card-component-delete-icon" />
                {/* </button> */}
              </AlertDialog.Trigger>
            )}
          </CardTitle>
          <CardDescription className="card-component-desc">
            <div className="card-component-desc-text">
              {flow.description}
              {/* {flow.description} */}
            </div>
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <div className="card-component-footer-arrangement">
            <div className="card-component-footer">
              {/* <Badge variant="secondary">Agent</Badge>
            <Badge variant="secondary">
              <div className="w-3">
                <OpenAiIcon />
              </div>
              <span className="text-base">&nbsp;</span>OpenAI+
            </Badge> */}
            </div>
            {button && button}
          </div>
        </CardFooter>
      </Card>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-[#00000040] data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-background p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-foreground m-0 text-[17px] font-medium">
            Are you absolutely sure?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-foreground mt-4 mb-5 text-[15px] leading-normal">
            This action cannot be undone. This will permanently delete this flow!
          </AlertDialog.Description>
          <div className="flex justify-end gap-[25px]">
            <AlertDialog.Cancel asChild>
              <button className="text-foreground transition-all bg-accent hover:bg-muted focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button onClick={onDelete} className="text-white transition-all bg-red-500 hover:bg-red-600 focus:shadow-red-100 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
