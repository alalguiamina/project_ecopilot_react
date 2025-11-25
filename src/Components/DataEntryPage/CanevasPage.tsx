import { useState } from "react";
import "./CanevasPage.css";
import Sidebar from "../Sidebar/Sidebar";
import { User } from "App";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "hooks/usePageTitle";
import Topbar from "Components/Topbar/Topbar";
import { ConfigDialog } from "../ConfigDialog/ConfigDialog";
import { Settings } from "lucide-react";

export const CanevasPage = ({ user }: { user?: User }) => {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const navigate = useNavigate();
  const handleLogout = () => navigate("/");

  const pageTitle = usePageTitle();
  const topbarProps = {
    title: pageTitle,
    userName: user?.username ?? "User",
    onLogout: handleLogout,
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar user={user!} />

      <div className="dashboard-content">
        <Topbar {...topbarProps} />

        <div className="data-entry-page">
          {/* PAGE HEADER */}
          <div className="page-header">
            <div className="page-header-content">
              <div>
                <h1>Canevas de Saisie</h1>
                <p>Saisissez vos données selon les modèles prédéfinis</p>
              </div>

              <button
                className="config-button"
                onClick={() => setIsConfigDialogOpen(true)}
                title="Configuration des sites"
              >
                <Settings size={20} />
                Configuration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIGURATION DIALOG */}
      <ConfigDialog
        isOpen={isConfigDialogOpen}
        onClose={() => setIsConfigDialogOpen(false)}
      />
    </div>
  );
};

export default CanevasPage;
