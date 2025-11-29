import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// ✅ KPI icons

import KpiCard from "../KpiCard/KpiCard";
import Sidebar from "Components/Sidebar/Sidebar";
import type { User as BackendUser } from "../../types/user";
import Topbar from "Components/Topbar/Topbar";
import { usePageTitle } from "hooks/usePageTitle";
import award from "../../Assets/award.png";
import leaf from "../../Assets/leaf.png";
import chart1 from "../../Assets/chart1.png";
import users from "../../Assets/users.png";

type DashboardProps = { user: BackendUser };

type PieDatum = {
  name: string;
  value: number;
  color: string;
};

type ESGDatum = {
  mois: string;
  environnement: number;
  social: number;
  gouvernance: number;
};

type EmissionDatum = {
  mois: string;
  emissions: number;
};

// 🔹 Données graphiques
const pieData: PieDatum[] = [
  { name: "Scope 1", value: 35, color: "#16a34a" },
  { name: "Scope 2", value: 25, color: "#3b82f6" },
  { name: "Scope 3", value: 40, color: "#f59e0b" },
];

const barData: ESGDatum[] = [
  { mois: "Jan", environnement: 75, social: 82, gouvernance: 88 },
  { mois: "Fév", environnement: 78, social: 85, gouvernance: 90 },
  { mois: "Mar", environnement: 82, social: 88, gouvernance: 92 },
  { mois: "Avr", environnement: 85, social: 90, gouvernance: 93 },
  { mois: "Mai", environnement: 88, social: 92, gouvernance: 95 },
  { mois: "Juin", environnement: 90, social: 94, gouvernance: 96 },
];

const lineData: EmissionDatum[] = [
  { mois: "Jan", emissions: 1200 },
  { mois: "Fév", emissions: 1150 },
  { mois: "Mar", emissions: 1100 },
  { mois: "Avr", emissions: 1050 },
  { mois: "Mai", emissions: 1000 },
  { mois: "Juin", emissions: 950 },
];
const emissionsData: EmissionDatum[] = [
  { mois: "Jan", emissions: 1200 },
  { mois: "Fév", emissions: 1150 },
  { mois: "Mar", emissions: 1100 },
  { mois: "Avr", emissions: 1050 },
  { mois: "Mai", emissions: 1000 },
  { mois: "Juin", emissions: 950 },
];

const kpiCardsData = [
  {
    label: "Score RSE Global",
    value: "87/100",
    subtitle: "+5 pts ce mois",
    icon: award,
    color: "green",
  },
  {
    label: "Bilan Carbone",
    value: "950 tCO₂e",
    subtitle: "-8% vs mois dernier",
    icon: leaf,
    color: "emerald",
  },
  {
    label: "Indicateurs ESG",
    value: "42/50",
    subtitle: "84% de conformité",
    icon: chart1,
    color: "blue",
  },
  {
    label: "Collaborateurs formés",
    value: "324",
    subtitle: "Sur 380 employés",
    icon: users,
    color: "purple",
  },
];

const Dashboard = ({ user }: DashboardProps) => {
  const navigate = useNavigate();
  const handleLogout = () => navigate("/");
  const pageTitle = usePageTitle();
  const topbarProps = {
    title: pageTitle,
    userName: user.username, // user.name
    onLogout: handleLogout,
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar user={user} />

      <div className="dashboard-content">
        <Topbar {...topbarProps} />
        <main className="main-dashboard">
          {/* KPI Cards */}
          <div className="kpi-cards-grid">
            {kpiCardsData.map((item) => {
              return (
                <KpiCard
                  label={item.label}
                  value={item.value}
                  subtitle={item.subtitle}
                  icon={item.icon}
                  color={item.color}
                />
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="charts-2-col">
            {/* Pie Chart */}
            <div className="card chart-card" style={{ minHeight: "400px" }}>
              <div className="card-header">
                <h3 className="card-title">
                  Répartition Émissions Carbone par Scope
                </h3>
                <p className="card-description">
                  Distribution des émissions GES
                </p>
              </div>
              <div className="card-content" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        const safePercent =
                          typeof percent === "number" ? percent : 0;
                        return `${name}: ${(safePercent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="card chart-card" style={{ minHeight: "400px" }}>
              <div className="card-header">
                <h3 className="card-title">Évolution des Indicateurs ESG</h3>
                <p className="card-description">
                  Performance mensuelle par pilier
                </p>
              </div>
              <div className="card-content" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="environnement" fill="#16a34a" />
                    <Bar dataKey="social" fill="#3b82f6" />
                    <Bar dataKey="gouvernance" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Line Chart Full Width */}
          <div className="card chart-card" style={{ minHeight: "400px" }}>
            <div className="card-header">
              <h3 className="card-title">Évolution des Émissions Carbone</h3>
              <p className="card-description">
                Tendance mensuelle des émissions totales (tCO₂e)
              </p>
            </div>
            <div className="card-content" style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="emissions"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
