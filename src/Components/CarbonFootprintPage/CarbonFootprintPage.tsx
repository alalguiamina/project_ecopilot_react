import { useState } from "react";
import "./CarbonFootprintPage.css";
import Sidebar from "../Sidebar/Sidebar";
import type { User as BackendUser } from "../../types/user";

type ActiveTab = "scope1" | "scope2" | "scope3";

type ScopeDatum = {
  name: string;
  value: number;
  color: string;
};

type EvolutionDatum = {
  mois: string;
  emissions: number;
  objectif: number;
};

type ScopeDetail = {
  source: string;
  emissions: number;
};

function CarbonFootprintPage({ user }: { user: BackendUser }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("scope1");

  const scopeData: ScopeDatum[] = [
    { name: "Scope 1", value: 332.5, color: "#16a34a" },
    { name: "Scope 2", value: 237.5, color: "#3b82f6" },
    { name: "Scope 3", value: 380, color: "#f59e0b" },
  ];

  const evolutionData: EvolutionDatum[] = [
    { mois: "Jan", emissions: 1200, objectif: 1150 },
    { mois: "Fév", emissions: 1150, objectif: 1100 },
    { mois: "Mar", emissions: 1100, objectif: 1050 },
    { mois: "Avr", emissions: 1050, objectif: 1000 },
    { mois: "Mai", emissions: 1000, objectif: 950 },
    { mois: "Juin", emissions: 950, objectif: 900 },
  ];

  const scope1Details: ScopeDetail[] = [
    { source: "Combustion diesel", emissions: 156.3 },
    { source: "Gaz naturel", emissions: 89.7 },
    { source: "Gaz réfrigérants", emissions: 23.5 },
    { source: "Émissions agricoles", emissions: 63.0 },
  ];

  const scope2Details: ScopeDetail[] = [
    { source: "Électricité réseau", emissions: 198.2 },
    { source: "Vapeur achetée", emissions: 39.3 },
  ];

  const scope3Details: ScopeDetail[] = [
    { source: "Transport amont", emissions: 125.8 },
    { source: "Achats matières premières", emissions: 156.4 },
    { source: "Déplacements professionnels", emissions: 43.2 },
    { source: "Traitement déchets", emissions: 54.6 },
  ];

  const totalEmissions = scopeData.reduce((sum, item) => sum + item.value, 0);
  const intensity = (totalEmissions / 1250).toFixed(2);
  const objective = 900;
  const compensation = 78;

  // Simple pie chart implementation
  const renderPieChart = () => {
    let currentAngle = 0;
    const radius = 100;
    const centerX = 150;
    const centerY = 150;

    return (
      <div className="pie-chart-container">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {scopeData.map((item, index) => {
            const percentage = item.value / totalEmissions;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const x1 =
              centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 =
              centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            currentAngle += angle;

            // Calculate label position
            const labelAngle = startAngle + angle / 2;
            const labelX =
              centerX + radius * 0.7 * Math.cos((labelAngle * Math.PI) / 180);
            const labelY =
              centerY + radius * 0.7 * Math.sin((labelAngle * Math.PI) / 180);

            return (
              <g key={index}>
                <path d={pathData} fill={item.color} />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {`${item.name}: ${(percentage * 100).toFixed(0)}%`}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="pie-legend">
          {scopeData.map((item, index) => (
            <div key={index} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: item.color }}
              ></div>
              <span>
                {item.name}: {item.value.toFixed(1)} tCO₂e
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple line chart implementation
  const renderLineChart = () => {
    const width = 600;
    const height = 300;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxEmissions = Math.max(
      ...evolutionData.map((datum) =>
        Math.max(datum.emissions, datum.objectif),
      ),
    );

    const xScale = (index: number) =>
      padding + (index / (evolutionData.length - 1)) * chartWidth;
    const yScale = (value: number) =>
      padding + chartHeight - (value / maxEmissions) * chartHeight;

    return (
      <div className="line-chart-container">
        <svg width={width} height={height}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <line
              key={`h-${i}`}
              x1={padding}
              y1={padding + i * chartHeight}
              x2={width - padding}
              y2={padding + i * chartHeight}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
            />
          ))}

          {/* X and Y axis */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#94a3b8"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#94a3b8"
          />

          {/* X axis labels */}
          {evolutionData.map((d, i) => (
            <text
              key={`x-${i}`}
              x={xScale(i)}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {d.mois}
            </text>
          ))}

          {/* Y axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <text
              key={`y-${i}`}
              x={padding - 10}
              y={padding + i * chartHeight}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="12"
              fill="#64748b"
            >
              {Math.round(maxEmissions * (1 - i))}
            </text>
          ))}

          {/* Emissions line */}
          <polyline
            points={evolutionData
              .map((d, i) => `${xScale(i)},${yScale(d.emissions)}`)
              .join(" ")}
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
          />

          {/* Emissions points */}
          {evolutionData.map((d, i) => (
            <circle
              key={`emissions-${i}`}
              cx={xScale(i)}
              cy={yScale(d.emissions)}
              r="4"
              fill="#16a34a"
            />
          ))}

          {/* Objective line */}
          <polyline
            points={evolutionData
              .map((d, i) => `${xScale(i)},${yScale(d.objectif)}`)
              .join(" ")}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Objective points */}
          {evolutionData.map((d, i) => (
            <circle
              key={`objectif-${i}`}
              cx={xScale(i)}
              cy={yScale(d.objectif)}
              r="4"
              fill="#f59e0b"
            />
          ))}
        </svg>

        <div className="chart-legend">
          <div className="legend-item">
            <div
              className="legend-line"
              style={{ backgroundColor: "#16a34a" }}
            ></div>
            <span>Émissions réelles</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-line"
              style={{ backgroundColor: "#f59e0b", borderStyle: "dashed" }}
            ></div>
            <span>Objectif</span>
          </div>
        </div>
      </div>
    );
  };

  // Simple bar chart implementation
  const renderBarChart = (data: ScopeDetail[], color: string) => {
    const width = 600;
    const height = 300;
    const padding = { top: 20, right: 40, bottom: 60, left: 200 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxEmissions = Math.max(...data.map((datum) => datum.emissions));

    return (
      <div className="bar-chart-container">
        <svg width={width} height={height}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <line
              key={`h-${i}`}
              x1={padding.left}
              y1={padding.top + i * chartHeight}
              x2={width - padding.right}
              y2={padding.top + i * chartHeight}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
            />
          ))}

          {/* X and Y axis */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#94a3b8"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#94a3b8"
          />

          {/* Y axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <text
              key={`y-${i}`}
              x={padding.left - 10}
              y={padding.top + (1 - i) * chartHeight}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="12"
              fill="#64748b"
            >
              {Math.round(maxEmissions * i)}
            </text>
          ))}

          {/* Bars and X axis labels */}
          {data.map((d, i) => {
            const barHeight = (d.emissions / maxEmissions) * chartHeight;
            const barY = height - padding.bottom - barHeight;
            const barX =
              padding.left + (i + 0.5) * (chartWidth / data.length) - 30;
            const barWidth = 60;

            return (
              <g key={i}>
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                />
                <text
                  x={barX + barWidth / 2}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {d.source}
                </text>
                <text
                  x={barX + barWidth / 2}
                  y={barY - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#334155"
                  fontWeight="bold"
                >
                  {d.emissions}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar user={user} />
      <div className="dashboard-content">
        <div className="carbon-footprint-page">
          <div className="page-header">
            <h1>Bilan Carbone</h1>
            <p>Suivi détaillé de vos émissions GES par scope</p>
            <button className="btn-export">
              <span>📥</span> Exporter en CSV
            </button>
          </div>

          {/* KPIs */}
          <div className="kpi-cards-grid">
            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-label">Émissions totales</span>
                <span className="kpi-icon">🌿</span>
              </div>
              <div className="kpi-value green">{totalEmissions.toFixed(1)}</div>
              <p className="kpi-subtitle">tCO₂e ce mois</p>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-label">Intensité carbone</span>
                <span className="kpi-icon">⚡</span>
              </div>
              <div className="kpi-value blue">{intensity}</div>
              <p className="kpi-subtitle">tCO₂e/tonne produite</p>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-label">Objectif annuel</span>
                <span className="kpi-icon">🎯</span>
              </div>
              <div className="kpi-value purple">{objective}</div>
              <p className="kpi-subtitle">tCO₂e/mois cible</p>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-label">Taux de compensation</span>
                <span className="kpi-icon">📉</span>
              </div>
              <div className="kpi-value emerald">{compensation}%</div>
              <p className="kpi-subtitle">via énergies vertes</p>
            </div>
          </div>

          {/* Graphiques principaux */}
          <div className="charts-2-col">
            <div className="card">
              <div className="card-header">
                <h2>Répartition par Scope</h2>
                <p className="card-description">
                  Distribution des émissions GES ({totalEmissions.toFixed(1)}{" "}
                  tCO₂e)
                </p>
              </div>
              <div className="card-content">{renderPieChart()}</div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Évolution mensuelle</h2>
                <p className="card-description">
                  Tendance des émissions vs objectif
                </p>
              </div>
              <div className="card-content">{renderLineChart()}</div>
            </div>
          </div>

          {/* Détails par scope */}
          <div className="card">
            <div className="card-header">
              <h2>Détails par Scope</h2>
              <p className="card-description">Sources d'émissions détaillées</p>
            </div>
            <div className="card-content">
              <div className="tabs-container">
                <div className="tabs-list">
                  <button
                    className={`tab-trigger ${activeTab === "scope1" ? "active" : ""}`}
                    onClick={() => setActiveTab("scope1")}
                  >
                    Scope 1
                  </button>
                  <button
                    className={`tab-trigger ${activeTab === "scope2" ? "active" : ""}`}
                    onClick={() => setActiveTab("scope2")}
                  >
                    Scope 2
                  </button>
                  <button
                    className={`tab-trigger ${activeTab === "scope3" ? "active" : ""}`}
                    onClick={() => setActiveTab("scope3")}
                  >
                    Scope 3
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === "scope1" && (
                    <div className="tab-pane">
                      <div className="scope-info">
                        <div className="scope-indicator green"></div>
                        <span>
                          Émissions directes contrôlées par l'entreprise
                        </span>
                      </div>
                      {renderBarChart(scope1Details, "#16a34a")}
                      <div className="scope-summary green">
                        <p>
                          <span className="font-semibold">Total Scope 1:</span>{" "}
                          {scopeData[0].value.toFixed(1)} tCO₂e
                        </p>
                        <p className="scope-actions">
                          Principales actions: Optimisation du parc véhicule,
                          maintenance des équipements, réduction des fuites
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "scope2" && (
                    <div className="tab-pane">
                      <div className="scope-info">
                        <div className="scope-indicator blue"></div>
                        <span>
                          Émissions indirectes liées à l'énergie achetée
                        </span>
                      </div>
                      {renderBarChart(scope2Details, "#3b82f6")}
                      <div className="scope-summary blue">
                        <p>
                          <span className="font-semibold">Total Scope 2:</span>{" "}
                          {scopeData[1].value.toFixed(1)} tCO₂e
                        </p>
                        <p className="scope-actions">
                          Principales actions: Installation de panneaux
                          solaires, achat d'électricité verte, efficacité
                          énergétique
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "scope3" && (
                    <div className="tab-pane">
                      <div className="scope-info">
                        <div className="scope-indicator orange"></div>
                        <span>
                          Autres émissions indirectes de la chaîne de valeur
                        </span>
                      </div>
                      {renderBarChart(scope3Details, "#f59e0b")}
                      <div className="scope-summary orange">
                        <p>
                          <span className="font-semibold">Total Scope 3:</span>{" "}
                          {scopeData[2].value.toFixed(1)} tCO₂e
                        </p>
                        <p className="scope-actions">
                          Principales actions: Optimisation logistique,
                          fournisseurs locaux, économie circulaire, télétravail
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarbonFootprintPage;
