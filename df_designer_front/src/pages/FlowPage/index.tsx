import { useContext, useEffect, useState } from "react";
import Page from "./components/PageComponent";
import { TabsContext } from "../../contexts/tabsContext";
import { useParams } from "react-router-dom";
import { getVersion } from "../../controllers/API";
import { NewLogo } from "../../icons/NewLogo";
import { animated, useSpring } from "@react-spring/web";

export default function FlowPage() {
  const { flows, tabId, setTabId } = useContext(TabsContext);

  // console.log(flows)

  useEffect(() => {
    // console.log(flows)
  }, [])

  const { id } = useParams();
  useEffect(() => {
    setTabId(id);
  }, [id]);

  // Initialize state variable for the version
  const [version, setVersion] = useState("0.0.43a");
  // useEffect(() => {
  //   getVersion().then((data) => {
  //     setVersion(data.version);
  //   });
  // }, []);

  // console.log(flows.find((flow) => flow.id === id))

  return (
    <div className="flow-page-positioning">
      {flows.length > 0 &&
        tabId !== "" &&
        flows.findIndex((flow) => flow.id === tabId) !== -1 && (
          <Page flow={flows.find((flow) => flow.id === tabId)} />
        )}
      <a
        target={"_blank"}
        href="https://deeppavlov.ai/"
        className="logspace-page-icon"
      >
        {version && <div className="mt-1 flex flex-row gap-2"> <NewLogo className="w-4 h-4" /> df_designer v{version}</div>}
        {/* <div className={"mt-1"}>Created by df_designer team </div> */}
      </a>
    </div>
  );
}
