import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/MainPage";
import FlowPage from "./pages/FlowPage";
import CommunityPage from "./pages/CommunityPage";
import PreviewPage from "./pages/PreviewPage";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/preview" element={<PreviewPage />} />
      <Route path="/flow/:id/">
        <Route path="" element={<FlowPage />} />
      </Route>
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default Router;
