import { Button, Icon, Layout } from "@stellar/design-system";
import "./App.module.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Debugger from "./pages/Debugger.tsx";
import { Marketplace } from "./pages/marketplace/Marketplace";
import { PublishContract } from "./pages/marketplace/PublishContract";
import { ContractDetails } from "./pages/marketplace/ContractDetails";
import { DeployWizard } from "./pages/marketplace/DeployWizard";
import { DeploymentHistory } from "./pages/marketplace/DeploymentHistory";
import { MarketplaceDebugger } from "./pages/marketplace/MarketplaceDebugger";
import { DeployedContractDebugger } from "./pages/marketplace/DeployedContractDebugger";

const AppLayout: React.FC = () => (
  <main>
    <Layout.Header
      projectId="ContractForge"
      projectTitle="ContractForge"
      contentRight={
        <>
          <nav style={{ display: "flex", gap: "0.5rem" }}>
            <NavLink
              to="/"
              style={{
                textDecoration: "none",
              }}
            >
              {({ isActive }) => (
                <Button variant="tertiary" size="md" disabled={isActive}>
                  <Icon.Home01 size="md" />
                  Home
                </Button>
              )}
            </NavLink>
            <NavLink
              to="/marketplace"
              style={{
                textDecoration: "none",
              }}
            >
              {({ isActive }) => (
                <Button variant="tertiary" size="md" disabled={isActive}>
                  <Icon.Package size="md" />
                  Marketplace
                </Button>
              )}
            </NavLink>
            <NavLink
              to="/deployments"
              style={{
                textDecoration: "none",
              }}
            >
              {({ isActive }) => (
                <Button variant="tertiary" size="md" disabled={isActive}>
                  <Icon.Rocket01 size="md" />
                  Deployments
                </Button>
              )}
            </NavLink>
            <NavLink
              to="/debug"
              style={{
                textDecoration: "none",
              }}
            >
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => (window.location.href = "/debug")}
                  disabled={isActive}
                >
                  <Icon.Code02 size="md" />
                  Debugger
                </Button>
              )}
            </NavLink>
          </nav>
          <ConnectAccount />
        </>
      }
    />
    <Outlet />
    <Layout.Footer>
      <span>
        © {new Date().getFullYear()} ContractForge. Licensed under the{" "}
        <a
          href="http://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apache License, Version 2.0
        </a>
        .
      </span>
    </Layout.Footer>
  </main>
);

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:contractId" element={<ContractDetails />} />
        <Route
          path="/marketplace/:contractId/deploy"
          element={<DeployWizard />}
        />
        <Route path="/publish" element={<PublishContract />} />
        <Route path="/deployments" element={<DeploymentHistory />} />
        <Route
          path="/deployments/:deploymentId/debug"
          element={<DeployedContractDebugger />}
        />
        <Route path="/debug" element={<Debugger />} />
        <Route
          path="/debug/marketplace/:contractId"
          element={<MarketplaceDebugger />}
        />
        <Route path="/debug/:contractName" element={<Debugger />} />
      </Route>
    </Routes>
  );
}

export default App;
