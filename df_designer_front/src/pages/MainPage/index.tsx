import { useContext, useEffect } from "react";
import { Download, Upload, Plus, Home, ExternalLink } from "lucide-react";
import { TabsContext } from "../../contexts/tabsContext";
import { Button } from "../../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CardComponent } from "../../components/cardComponent";
import { USER_PROJECTS_HEADER } from "../../constants";
import AddFlowModal from "../../modals/addFlowModal";
import { PopUpContext } from "../../contexts/popUpContext";
export default function HomePage() {
  const { openPopUp } = useContext(PopUpContext)
  const { flows, setTabId, downloadFlows, uploadFlows, addFlow, removeFlow } =
    useContext(TabsContext);
  useEffect(() => {
    setTabId("");
  }, []);
  const navigate = useNavigate();
  return (
    <div className="main-page-panel">
      <div className="main-page-nav-arrangement">
        <span className="main-page-nav-title">
          <Home className="w-6" />
          {USER_PROJECTS_HEADER}
        </span>
        <div className="button-div-style">
          <Button
            variant="primary"
            onClick={() => {
              downloadFlows();
            }}
          >
            <Download className="main-page-nav-button" />
            Download Collection
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              uploadFlows();
            }}
          >
            <Upload className="main-page-nav-button" />
            Upload Collection
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // addFlow(null, true).then((id) => {
              //   navigate("/flow/" + id);
              // });
              openPopUp(<AddFlowModal />)
            }}
          >
            <Plus className="main-page-nav-button" />
            New Project
          </Button>
        </div>
      </div>
      <span className="main-page-description-text">
        Manage your personal projects. Download or upload your collection.
      </span>
      <div className="main-page-flows-display">
        {flows.map((flow, idx) => (
          <CardComponent
            key={idx}
            flow={flow}
            id={flow.id}
            button={
              <Link to={"/flow/" + flow.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap "
                >
                  <ExternalLink className="main-page-nav-button" />
                  Edit Flow
                </Button>
              </Link>
            }
            onDelete={() => {
              removeFlow(flow.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
