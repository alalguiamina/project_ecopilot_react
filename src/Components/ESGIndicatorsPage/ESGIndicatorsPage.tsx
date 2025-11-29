import React, { useState, ReactNode } from "react";
import "./ESGIndicatorsPage.css";
import Sidebar from "../Sidebar/Sidebar";
import type { User as BackendUser } from "../../types/user";

type EnergyDatum = {
  mois: string;
  consommation: number;
  objectif: number;
};

type WaterDatum = EnergyDatum;

type WasteDatum = {
  mois: string;
  recycles: number;
  objectif: number;
};

type SocialDatum = {
  mois: string;
  formation: number;
  securite: number;
};

type SocietaleDatum = {
  mois: string;
  impact: number;
  beneficiaires: number;
};

type GouvernanceDatum = {
  mois: string;
  conformite: number;
  audits: number;
};

type SectionKey =
  | "energie"
  | "eau"
  | "dechets"
  | "sociale"
  | "societale"
  | "gouvernance";

type ChartDatum = Record<string, number | string>;

const getNumericValue = (datum: ChartDatum, key: string) => {
  const value = datum[key];
  return typeof value === "number" ? value : Number(value ?? 0);
};

// Accept a tolerant user prop to avoid strict cross-module User type mismatch.
// Sidebar itself expects a minimal SidebarUser; passing `any` here avoids TS conflicts
// while keeping runtime behavior unchanged.
function ESGIndicatorsPage({ user }: { user?: BackendUser }) {
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(
    null,
  );

  // Données pour Gestion de l'énergie
  const energieData: EnergyDatum[] = [
    { mois: "Jan", consommation: 12500, objectif: 13000 },
    { mois: "Fév", consommation: 12200, objectif: 12800 },
    { mois: "Mar", consommation: 11800, objectif: 12500 },
    { mois: "Avr", consommation: 11500, objectif: 12000 },
    { mois: "Mai", consommation: 11200, objectif: 11800 },
    { mois: "Juin", consommation: 10900, objectif: 11500 },
  ];

  // Données pour Gestion de l'eau
  const eauData: WaterDatum[] = [
    { mois: "Jan", consommation: 8500, objectif: 9000 },
    { mois: "Fév", consommation: 8200, objectif: 8800 },
    { mois: "Mar", consommation: 7900, objectif: 8500 },
    { mois: "Avr", consommation: 7600, objectif: 8200 },
    { mois: "Mai", consommation: 7300, objectif: 8000 },
    { mois: "Juin", consommation: 7000, objectif: 7800 },
  ];

  // Données pour Gestion des déchets
  const dechetsData: WasteDatum[] = [
    { mois: "Jan", recycles: 75, objectif: 80 },
    { mois: "Fév", recycles: 78, objectif: 80 },
    { mois: "Mar", recycles: 82, objectif: 82 },
    { mois: "Avr", recycles: 85, objectif: 85 },
    { mois: "Mai", recycles: 88, objectif: 88 },
    { mois: "Juin", recycles: 90, objectif: 90 },
  ];

  // Données pour Social - Sociale
  const socialeData: SocialDatum[] = [
    { mois: "Jan", formation: 65, securite: 92 },
    { mois: "Fév", formation: 70, securite: 93 },
    { mois: "Mar", formation: 75, securite: 94 },
    { mois: "Avr", formation: 80, securite: 94 },
    { mois: "Mai", formation: 85, securite: 95 },
    { mois: "Juin", formation: 88, securite: 95 },
  ];

  // Données pour Social - Sociétale
  const societaleData: SocietaleDatum[] = [
    { mois: "Jan", impact: 70, beneficiaires: 450 },
    { mois: "Fév", impact: 72, beneficiaires: 480 },
    { mois: "Mar", impact: 75, beneficiaires: 520 },
    { mois: "Avr", impact: 78, beneficiaires: 560 },
    { mois: "Mai", impact: 80, beneficiaires: 600 },
    { mois: "Juin", impact: 82, beneficiaires: 650 },
  ];

  // Données pour Gouvernance
  const gouvernanceData: GouvernanceDatum[] = [
    { mois: "Jan", conformite: 92, audits: 3 },
    { mois: "Fév", conformite: 93, audits: 3 },
    { mois: "Mar", conformite: 94, audits: 4 },
    { mois: "Avr", conformite: 95, audits: 4 },
    { mois: "Mai", conformite: 96, audits: 5 },
    { mois: "Juin", conformite: 96, audits: 5 },
  ];

  const toggleSection = (section: SectionKey) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Simple line chart implementation
  const renderLineChart = (
    data: ChartDatum[],
    color1: string,
    color2: string,
    key1: string,
    key2: string,
    name1: string,
    name2: string,
  ) => {
    const width = 600;
    const height = 300;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxValue = Math.max(
      ...data.map((datum) =>
        Math.max(getNumericValue(datum, key1), getNumericValue(datum, key2)),
      ),
    );

    const xScale = (index: number) =>
      padding + (index / (data.length - 1)) * chartWidth;
    const yScale = (value: number) =>
      padding + chartHeight - (value / maxValue) * chartHeight;

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
          {data.map((datum, index) => (
            <text
              key={`x-${index}`}
              x={xScale(index)}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {datum.mois}
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
              {Math.round(maxValue * (1 - i))}
            </text>
          ))}

          {/* First line */}
          <polyline
            points={data
              .map((datum, index) => {
                const value = getNumericValue(datum, key1);
                return `${xScale(index)},${yScale(value)}`;
              })
              .join(" ")}
            fill="none"
            stroke={color1}
            strokeWidth="2"
          />

          {/* First line points */}
          {data.map((datum, index) => {
            const value = getNumericValue(datum, key1);
            return (
              <circle
                key={`${key1}-${index}`}
                cx={xScale(index)}
                cy={yScale(value)}
                r="4"
                fill={color1}
              />
            );
          })}

          {/* Second line */}
          <polyline
            points={data
              .map((datum, index) => {
                const value = getNumericValue(datum, key2);
                return `${xScale(index)},${yScale(value)}`;
              })
              .join(" ")}
            fill="none"
            stroke={color2}
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Second line points */}
          {data.map((datum, index) => {
            const value = getNumericValue(datum, key2);
            return (
              <circle
                key={`${key2}-${index}`}
                cx={xScale(index)}
                cy={yScale(value)}
                r="4"
                fill={color2}
              />
            );
          })}
        </svg>

        <div className="chart-legend">
          <div className="legend-item">
            <div
              className="legend-line"
              style={{ backgroundColor: color1 }}
            ></div>
            <span>{name1}</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-line"
              style={{ backgroundColor: color2, borderStyle: "dashed" }}
            ></div>
            <span>{name2}</span>
          </div>
        </div>
      </div>
    );
  };

  // Simple bar chart implementation
  const renderBarChart = (
    data: ChartDatum[],
    color1: string,
    color2: string,
    key1: string,
    key2: string,
    name1: string,
    name2: string,
  ) => {
    const width = 600;
    const height = 300;
    const padding = { top: 20, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(
      ...data.map((datum) =>
        Math.max(getNumericValue(datum, key1), getNumericValue(datum, key2)),
      ),
    );

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
              {Math.round(maxValue * i)}
            </text>
          ))}

          {/* Bars and X axis labels */}
          {data.map((datum, index) => {
            const value1 = getNumericValue(datum, key1);
            const value2 = getNumericValue(datum, key2);
            const bar1Height = (value1 / maxValue) * chartHeight;
            const bar1Y = height - padding.bottom - bar1Height;
            const bar2Height = (value2 / maxValue) * chartHeight;
            const bar2Y = height - padding.bottom - bar2Height;

            const slotWidth = chartWidth / data.length;
            const barX = padding.left + (index + 0.5) * slotWidth;
            const barWidth = (chartWidth / data.length) * 0.3;
            const bar1X = barX - barWidth;
            const bar2X = barX;

            return (
              <g key={index}>
                <rect
                  x={bar1X}
                  y={bar1Y}
                  width={barWidth}
                  height={bar1Height}
                  fill={color1}
                />
                <rect
                  x={bar2X}
                  y={bar2Y}
                  width={barWidth}
                  height={bar2Height}
                  fill={color2}
                />
                <text
                  x={barX}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {datum.mois}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="chart-legend">
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: color1 }}
            ></div>
            <span>{name1}</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: color2 }}
            ></div>
            <span>{name2}</span>
          </div>
        </div>
      </div>
    );
  };

  // Simple dual axis chart implementation
  const renderDualAxisChart = (
    data: ChartDatum[],
    color1: string,
    color2: string,
    key1: string,
    key2: string,
    name1: string,
    name2: string,
  ) => {
    const width = 600;
    const height = 300;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxLeft = Math.max(
      ...data.map((datum) => getNumericValue(datum, key1)),
    );
    const maxRight = Math.max(
      ...data.map((datum) => getNumericValue(datum, key2)),
    );

    const xScale = (index: number) =>
      padding + (index / (data.length - 1)) * chartWidth;
    const yScaleLeft = (value: number) =>
      padding + chartHeight - (value / maxLeft) * chartHeight;
    const yScaleRight = (value: number) =>
      padding + chartHeight - (value / maxRight) * chartHeight;

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
          <line
            x1={width - padding}
            y1={padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#94a3b8"
          />

          {/* X axis labels */}
          {data.map((datum, index) => (
            <text
              key={`x-${index}`}
              x={xScale(index)}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {datum.mois}
            </text>
          ))}

          {/* Left Y axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <text
              key={`y-left-${i}`}
              x={padding - 10}
              y={padding + i * chartHeight}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="12"
              fill="#64748b"
            >
              {Math.round(maxLeft * (1 - i))}
            </text>
          ))}

          {/* Right Y axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <text
              key={`y-right-${i}`}
              x={width - padding + 10}
              y={padding + i * chartHeight}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize="12"
              fill="#64748b"
            >
              {Math.round(maxRight * (1 - i))}
            </text>
          ))}

          {/* First line */}
          <polyline
            points={data
              .map((datum, index) => {
                const value = getNumericValue(datum, key1);
                return `${xScale(index)},${yScaleLeft(value)}`;
              })
              .join(" ")}
            fill="none"
            stroke={color1}
            strokeWidth="2"
          />

          {/* First line points */}
          {data.map((datum, index) => {
            const value = getNumericValue(datum, key1);
            return (
              <circle
                key={`${key1}-${index}`}
                cx={xScale(index)}
                cy={yScaleLeft(value)}
                r="4"
                fill={color1}
              />
            );
          })}

          {/* Second line */}
          <polyline
            points={data
              .map((datum, index) => {
                const value = getNumericValue(datum, key2);
                return `${xScale(index)},${yScaleRight(value)}`;
              })
              .join(" ")}
            fill="none"
            stroke={color2}
            strokeWidth="2"
          />

          {/* Second line points */}
          {data.map((datum, index) => {
            const value = getNumericValue(datum, key2);
            return (
              <circle
                key={`${key2}-${index}`}
                cx={xScale(index)}
                cy={yScaleRight(value)}
                r="4"
                fill={color2}
              />
            );
          })}
        </svg>

        <div className="chart-legend">
          <div className="legend-item">
            <div
              className="legend-line"
              style={{ backgroundColor: color1 }}
            ></div>
            <span>{name1}</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-line"
              style={{ backgroundColor: color2 }}
            ></div>
            <span>{name2}</span>
          </div>
        </div>
      </div>
    );
  };

  // Progress bar component
  type ProgressBarProps = {
    value: number;
    className?: string;
  };

  const ProgressBar = ({ value, className = "" }: ProgressBarProps) => {
    return (
      <div className={`progress-bar ${className}`.trim()}>
        <div className="progress-fill" style={{ width: `${value}%` }}></div>
      </div>
    );
  };

  // Badge component
  type BadgeProps = {
    children: ReactNode;
    className?: string;
  };

  const Badge = ({ children, className = "" }: BadgeProps) => {
    return <span className={`badge ${className}`.trim()}>{children}</span>;
  };

  // Trend icon component
  type Trend = "up" | "down" | "stable";

  type TrendIconProps = {
    trend: Trend;
  };

  const TrendIcon = ({ trend }: TrendIconProps) => {
    if (trend === "up") return <span className="trend-icon up">📈</span>;
    if (trend === "down") return <span className="trend-icon down">📉</span>;
    return <span className="trend-icon stable">➖</span>;
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar user={user} />
      <div className="dashboard-content">
        <div className="esg-indicators-page">
          <div className="page-header">
            <h1>Indicateurs ESG</h1>
            <p>Performance environnementale, sociale et de gouvernance</p>
          </div>

          {/* Score global */}
          <div className="score-cards-grid">
            <div className="score-card">
              <div className="score-card-header">
                <span className="score-label">Environnement</span>
                <span className="score-icon">🌿</span>
              </div>
              <div className="score-value green">90/100</div>
              <ProgressBar value={90} className="mt-3" />
              <p className="score-change">+5 pts vs mois dernier</p>
            </div>

            <div className="score-card">
              <div className="score-card-header">
                <span className="score-label">Social</span>
                <span className="score-icon">👥</span>
              </div>
              <div className="score-value blue">94/100</div>
              <ProgressBar value={94} className="mt-3" />
              <p className="score-change">+2 pts vs mois dernier</p>
            </div>

            <div className="score-card">
              <div className="score-card-header">
                <span className="score-label">Gouvernance</span>
                <span className="score-icon">🏢</span>
              </div>
              <div className="score-value purple">96/100</div>
              <ProgressBar value={96} className="mt-3" />
              <p className="score-change">+1 pt vs mois dernier</p>
            </div>
          </div>

          {/* SECTION E - ENVIRONNEMENT */}
          <div className="esg-section">
            <h2 className="section-title">
              <span className="section-icon green">🌿</span>
              Indicateurs E (Environnement)
            </h2>

            {/* Gestion de l'énergie */}
            <div className="expandable-card">
              <button
                onClick={() => toggleSection("energie")}
                className="expandable-header"
              >
                <div className="expandable-title">
                  <div className="icon-container yellow">
                    <span className="icon">⚡</span>
                  </div>
                  <div>
                    <h3>Gestion de l'énergie</h3>
                    <p>Suivi de la consommation énergétique</p>
                  </div>
                </div>
                <div className="expandable-metrics">
                  <div className="metric-value yellow">10,900 kWh</div>
                  <p className="metric-label">Ce mois</p>
                  <span className="expand-icon">
                    {expandedSection === "energie" ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedSection === "energie" && (
                <div className="expandable-content">
                  <div className="metrics-grid">
                    <div className="metric-card yellow">
                      <p className="metric-title">Consommation totale</p>
                      <p className="metric-value">10,900 kWh</p>
                      <div className="trend">
                        <TrendIcon trend="down" />
                        <span className="trend-text">-5% vs mois dernier</span>
                      </div>
                    </div>
                    <div className="metric-card green">
                      <p className="metric-title">Énergie renouvelable</p>
                      <p className="metric-value">42%</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">+8% vs mois dernier</span>
                      </div>
                    </div>
                    <div className="metric-card blue">
                      <p className="metric-title">Intensité énergétique</p>
                      <p className="metric-value">0.87 kWh/kg</p>
                      <div className="trend">
                        <TrendIcon trend="down" />
                        <span className="trend-text">-3% vs mois dernier</span>
                      </div>
                    </div>
                  </div>

                  {renderLineChart(
                    energieData,
                    "#eab308",
                    "#64748b",
                    "consommation",
                    "objectif",
                    "Consommation",
                    "Objectif",
                  )}
                </div>
              )}
            </div>

            {/* Gestion de l'eau */}
            <div className="expandable-card">
              <button
                onClick={() => toggleSection("eau")}
                className="expandable-header"
              >
                <div className="expandable-title">
                  <div className="icon-container blue">
                    <span className="icon">💧</span>
                  </div>
                  <div>
                    <h3>Gestion de l'eau</h3>
                    <p>Suivi de la consommation d'eau</p>
                  </div>
                </div>
                <div className="expandable-metrics">
                  <div className="metric-value blue">7,000 m³</div>
                  <p className="metric-label">Ce mois</p>
                  <span className="expand-icon">
                    {expandedSection === "eau" ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedSection === "eau" && (
                <div className="expandable-content">
                  <div className="metrics-grid">
                    <div className="metric-card blue">
                      <p className="metric-title">Consommation totale</p>
                      <p className="metric-value">7,000 m³</p>
                      <div className="trend">
                        <TrendIcon trend="down" />
                        <span className="trend-text">-4% vs mois dernier</span>
                      </div>
                    </div>
                    <div className="metric-card cyan">
                      <p className="metric-title">Eau recyclée</p>
                      <p className="metric-value">35%</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">+6% vs mois dernier</span>
                      </div>
                    </div>
                    <div className="metric-card teal">
                      <p className="metric-title">Efficacité irrigation</p>
                      <p className="metric-value">88%</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">+2% vs mois dernier</span>
                      </div>
                    </div>
                  </div>

                  {renderBarChart(
                    eauData,
                    "#3b82f6",
                    "#94a3b8",
                    "consommation",
                    "objectif",
                    "Consommation",
                    "Objectif",
                  )}
                </div>
              )}
            </div>

            {/* Gestion des déchets */}
            <div className="expandable-card">
              <button
                onClick={() => toggleSection("dechets")}
                className="expandable-header"
              >
                <div className="expandable-title">
                  <div className="icon-container green">
                    <span className="icon">♻️</span>
                  </div>
                  <div>
                    <h3>Gestion des déchets</h3>
                    <p>Taux de recyclage et valorisation</p>
                  </div>
                </div>
                <div className="expandable-metrics">
                  <div className="metric-value green">90%</div>
                  <p className="metric-label">Taux recyclage</p>
                  <span className="expand-icon">
                    {expandedSection === "dechets" ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedSection === "dechets" && (
                <div className="expandable-content">
                  <div className="metrics-grid">
                    <div className="metric-card green">
                      <p className="metric-title">Taux de recyclage</p>
                      <p className="metric-value">90%</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">+2% vs mois dernier</span>
                      </div>
                    </div>
                    <div className="metric-card emerald">
                      <p className="metric-title">Déchets valorisés</p>
                      <p className="metric-value">125 tonnes</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">+10% vs mois dernier</span>
                      </div>
                    </div>
                    <div className="metric-card lime">
                      <p className="metric-title">Compostage</p>
                      <p className="metric-value">68 tonnes</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">+15% vs mois dernier</span>
                      </div>
                    </div>
                  </div>

                  {renderLineChart(
                    dechetsData,
                    "#16a34a",
                    "#64748b",
                    "recycles",
                    "objectif",
                    "Recyclés %",
                    "Objectif %",
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION S - SOCIAL */}
          <div className="esg-section">
            <h2 className="section-title">
              <span className="section-icon blue">👥</span>
              Indicateurs S (Social)
            </h2>

            {/* Sociale */}
            <div className="expandable-card">
              <button
                onClick={() => toggleSection("sociale")}
                className="expandable-header"
              >
                <div className="expandable-title">
                  <div className="icon-container blue">
                    <span className="icon">❤️</span>
                  </div>
                  <div>
                    <h3>Sociale</h3>
                    <p>Bien-être et développement des employés</p>
                  </div>
                </div>
                <div className="expandable-metrics">
                  <div className="metric-value blue">88%</div>
                  <p className="metric-label">Employés formés</p>
                  <span className="expand-icon">
                    {expandedSection === "sociale" ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedSection === "sociale" && (
                <div className="expandable-content">
                  <div className="metrics-grid">
                    <div className="metric-card blue">
                      <p className="metric-title">Employés formés</p>
                      <p className="metric-value">88%</p>
                      <Badge className="mt-2">324/380 employés</Badge>
                    </div>
                    <div className="metric-card indigo">
                      <p className="metric-title">Sécurité au travail</p>
                      <p className="metric-value">95%</p>
                      <Badge className="mt-2">0 accident ce mois</Badge>
                    </div>
                    <div className="metric-card violet">
                      <p className="metric-title">Satisfaction employés</p>
                      <p className="metric-value">82%</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">
                          +4% vs année dernière
                        </span>
                      </div>
                    </div>
                  </div>

                  {renderBarChart(
                    socialeData,
                    "#3b82f6",
                    "#8b5cf6",
                    "formation",
                    "securite",
                    "Formation %",
                    "Sécurité %",
                  )}
                </div>
              )}
            </div>

            {/* Sociétale */}
            <div className="expandable-card">
              <button
                onClick={() => toggleSection("societale")}
                className="expandable-header"
              >
                <div className="expandable-title">
                  <div className="icon-container cyan">
                    <span className="icon">🌍</span>
                  </div>
                  <div>
                    <h3>Sociétale</h3>
                    <p>Impact sur les communautés locales</p>
                  </div>
                </div>
                <div className="expandable-metrics">
                  <div className="metric-value cyan">650</div>
                  <p className="metric-label">Bénéficiaires</p>
                  <span className="expand-icon">
                    {expandedSection === "societale" ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedSection === "societale" && (
                <div className="expandable-content">
                  <div className="metrics-grid">
                    <div className="metric-card cyan">
                      <p className="metric-title">Impact communautaire</p>
                      <p className="metric-value">82%</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">+2% vs mois dernier</span>
                      </div>
                    </div>
                    <div className="metric-card sky">
                      <p className="metric-title">Bénéficiaires totaux</p>
                      <p className="metric-value">650</p>
                      <Badge className="mt-2">+50 ce mois</Badge>
                    </div>
                    <div className="metric-card blue">
                      <p className="metric-title">Projets communautaires</p>
                      <p className="metric-value">8</p>
                      <Badge className="mt-2">En cours</Badge>
                    </div>
                  </div>

                  {renderDualAxisChart(
                    societaleData,
                    "#06b6d4",
                    "#0284c7",
                    "impact",
                    "beneficiaires",
                    "Impact %",
                    "Bénéficiaires",
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION G - GOUVERNANCE */}
          <div className="esg-section">
            <h2 className="section-title">
              <span className="section-icon purple">🏢</span>
              Indicateurs G (Gouvernance)
            </h2>

            <div className="expandable-card">
              <button
                onClick={() => toggleSection("gouvernance")}
                className="expandable-header"
              >
                <div className="expandable-title">
                  <div className="icon-container purple">
                    <span className="icon">🏢</span>
                  </div>
                  <div>
                    <h3>Gouvernance</h3>
                    <p>Conformité, transparence et éthique</p>
                  </div>
                </div>
                <div className="expandable-metrics">
                  <div className="metric-value purple">96%</div>
                  <p className="metric-label">Conformité</p>
                  <span className="expand-icon">
                    {expandedSection === "gouvernance" ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedSection === "gouvernance" && (
                <div className="expandable-content">
                  <div className="metrics-grid">
                    <div className="metric-card purple">
                      <p className="metric-title">Conformité réglementaire</p>
                      <p className="metric-value">96%</p>
                      <div className="trend">
                        <TrendIcon trend="stable" />
                        <span className="trend-text">Stable</span>
                      </div>
                    </div>
                    <div className="metric-card fuchsia">
                      <p className="metric-title">Audits réalisés</p>
                      <p className="metric-value">5</p>
                      <Badge className="mt-2">Ce semestre</Badge>
                    </div>
                    <div className="metric-card pink">
                      <p className="metric-title">Transparence reporting</p>
                      <p className="metric-value">92%</p>
                      <div className="trend">
                        <TrendIcon trend="up" />
                        <span className="trend-text">
                          +3% vs année dernière
                        </span>
                      </div>
                    </div>
                  </div>

                  {renderDualAxisChart(
                    gouvernanceData,
                    "#8b5cf6",
                    "#a855f7",
                    "conformite",
                    "audits",
                    "Conformité %",
                    "Audits",
                  )}

                  <div className="governance-metrics">
                    <div className="governance-metric">
                      <div className="metric-header">
                        <span>Éthique fournisseurs</span>
                        <Badge>84%</Badge>
                      </div>
                      <ProgressBar value={84} />
                    </div>
                    <div className="governance-metric">
                      <div className="metric-header">
                        <span>Gestion des risques</span>
                        <Badge>87%</Badge>
                      </div>
                      <ProgressBar value={87} />
                    </div>
                    <div className="governance-metric">
                      <div className="metric-header">
                        <span>Formation anti-corruption</span>
                        <Badge>100%</Badge>
                      </div>
                      <ProgressBar value={100} />
                    </div>
                    <div className="governance-metric">
                      <div className="metric-header">
                        <span>Code de conduite</span>
                        <Badge>95%</Badge>
                      </div>
                      <ProgressBar value={95} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ESGIndicatorsPage;
