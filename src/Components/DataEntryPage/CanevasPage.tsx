import { useState } from "react";
import "./CanevasPage.css";
import Sidebar from "../Sidebar/Sidebar";
import boltIcon from "../../Assets/bolt.png";
import trashIcon from "../../Assets/trash.png";
import waterIcon from "../../Assets/water.png";
import productionIcon from "../../Assets/production.png";
import socialIcon from "../../Assets/social.png";
import deleteIcon from "../../Assets/delete.png";
import YearDataEntry from "Components/YearDataEntry/YearDataEntry";
import MonthDataEntry from "Components/MonthDataEntry/MonthDataEntry";
import SiteDataEntry from "Components/SiteDataEntry/SiteDataEntry";
import { User } from "App";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "hooks/usePageTitle";
import Topbar from "Components/Topbar/Topbar";

type CategoryId = "energie" | "eau" | "dechets" | "social" | "production";

type Category = {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type BaseForm = {
  annee: string;
  mois: string;
  site: string;
};

type EnergieForm = BaseForm & {
  type: string;
  unite: string;
  valeur: string;
};

type EauForm = BaseForm & {
  familleCulture: string;
  variete: string;
  volumeEau: string;
};

type DechetsForm = BaseForm & {
  categorie: string;
  unite: string;
  valeur: string;
};

type SocialForm = BaseForm & {
  action: string;
  budget: string;
  beneficiaires: string;
};

type ProductionForm = BaseForm & {
  action: string;
  budget: string;
  beneficiaires: string;
};

type DataEntryRecord = {
  id: number;
  category: string;
} & Record<string, string | number>;

export const CanevasPage = ({ user }: { user?: User }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "">("");
  const [entries, setEntries] = useState<DataEntryRecord[]>([]);
  const [saved, setSaved] = useState(false);

  // États pour les formulaires
  const [energieData, setEnergieData] = useState<EnergieForm>({
    annee: "2025",
    mois: "",
    site: "",
    type: "",
    unite: "",
    valeur: "",
  });

  const [eauData, setEauData] = useState<EauForm>({
    annee: "2025",
    mois: "",
    site: "",
    familleCulture: "",
    variete: "",
    volumeEau: "",
  });

  const [dechetsData, setDechetsData] = useState<DechetsForm>({
    annee: "2025",
    mois: "",
    site: "",
    categorie: "",
    unite: "",
    valeur: "",
  });

  const [socialData, setSocialData] = useState<SocialForm>({
    annee: "2025",
    mois: "",
    site: "",
    action: "",
    budget: "",
    beneficiaires: "",
  });

  const [productionData, setProductionData] = useState<ProductionForm>({
    annee: "2025",
    mois: "",
    site: "",
    action: "",
    budget: "",
    beneficiaires: "",
  });

  const categories: Category[] = [
    { id: "energie", name: "Énergie", icon: boltIcon, color: "#eab308" },
    { id: "eau", name: "Eau", icon: waterIcon, color: "#3b82f6" },
    { id: "dechets", name: "Déchets", icon: trashIcon, color: "#22c55e" },
    { id: "social", name: "Social", icon: socialIcon, color: "#a855f7" },
    {
      id: "production",
      name: "Production",
      icon: productionIcon,
      color: "#10b981",
    },
  ];

  const mois: SelectOption[] = [
    { value: "01", label: "Janvier" },
    { value: "02", label: "Février" },
    { value: "03", label: "Mars" },
    { value: "04", label: "Avril" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Juin" },
    { value: "07", label: "Juillet" },
    { value: "08", label: "Août" },
    { value: "09", label: "Septembre" },
    { value: "10", label: "Octobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Décembre" },
  ];

  const sites: SelectOption[] = [
    { value: "benguerir", label: "Benguerir — Ferme expérimentale" },
    { value: "settat", label: "Settat — Ferme Doukkala" },
    { value: "meknes", label: "Meknès — Domaine Oléicole" },
    { value: "agadir", label: "Agadir — Station Maraîchère" },
    { value: "errachidia", label: "Errachidia — Oasis Erfoud" },
    { value: "khouribga", label: "Khouribga — Site Énergie Verte" },
    { value: "larache", label: "Larache — Usine de transformation" },
  ];

  const handleAddLine = () => {
    let newEntry: DataEntryRecord | null = null;

    switch (selectedCategory) {
      case "energie":
        if (!energieData.mois || !energieData.site || !energieData.type) {
          alert("Veuillez remplir tous les champs obligatoires");
          return;
        }
        newEntry = {
          id: Date.now(),
          category: "Énergie",
          ...energieData,
        };
        setEnergieData({
          annee: "2025",
          mois: "",
          site: "",
          type: "",
          unite: "",
          valeur: "",
        });
        break;
      case "eau":
        if (!eauData.mois || !eauData.site || !eauData.volumeEau) {
          alert("Veuillez remplir tous les champs obligatoires");
          return;
        }
        newEntry = {
          id: Date.now(),
          category: "Eau",
          ...eauData,
        };
        setEauData({
          annee: "2025",
          mois: "",
          site: "",
          familleCulture: "",
          variete: "",
          volumeEau: "",
        });
        break;
      case "dechets":
        if (!dechetsData.mois || !dechetsData.site || !dechetsData.valeur) {
          alert("Veuillez remplir tous les champs obligatoires");
          return;
        }
        newEntry = {
          id: Date.now(),
          category: "Déchets",
          ...dechetsData,
        };
        setDechetsData({
          annee: "2025",
          mois: "",
          site: "",
          categorie: "",
          unite: "",
          valeur: "",
        });
        break;
      case "social":
        if (!socialData.mois || !socialData.site || !socialData.action) {
          alert("Veuillez remplir tous les champs obligatoires");
          return;
        }
        newEntry = {
          id: Date.now(),
          category: "Social",
          ...socialData,
        };
        setSocialData({
          annee: "2025",
          mois: "",
          site: "",
          action: "",
          budget: "",
          beneficiaires: "",
        });
        break;
      case "production":
        if (
          !productionData.mois ||
          !productionData.site ||
          !productionData.action
        ) {
          alert("Veuillez remplir tous les champs obligatoires");
          return;
        }
        newEntry = {
          id: Date.now(),
          category: "Production",
          ...productionData,
        };
        setProductionData({
          annee: "2025",
          mois: "",
          site: "",
          action: "",
          budget: "",
          beneficiaires: "",
        });
        break;
      default:
        return;
    }

    if (newEntry !== null) {
      const entryToAdd = newEntry;
      setEntries((prev) => [...prev, entryToAdd]);
    }
  };

  const handleSubmit = () => {
    if (entries.length === 0) {
      alert("Aucune donnée à soumettre");
      return;
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEntries([]);
    }, 3000);
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const getSiteLabel = (value: string) => {
    const site = sites.find((s) => s.value === value);
    return site ? site.label.split("—")[0].trim() : value;
  };

  const getMoisLabel = (value: string) => {
    const month = mois.find((m) => m.value === value);
    return month ? month.label : value;
  };

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
      <Sidebar user={user} />
      <div className="dashboard-content">
        <Topbar {...topbarProps} />
        <div className="data-entry-page">
          <div className="page-header">
            <h1>Canevas de Saisie</h1>
            <p>Saisissez vos données selon les modèles prédéfinis</p>
          </div>

          {/* Sélecteur de catégorie */}
          <div className="card">
            <div className="card-header">
              <h2>Sélectionner une catégorie</h2>
              <p className="card-description">
                Choisissez le type de données à saisir
              </p>
            </div>
            <div className="card-content">
              <div className="category-grid">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
                    style={
                      selectedCategory === cat.id
                        ? {
                            backgroundColor: `${cat.color}20`,
                            borderColor: cat.color,
                            color: cat.color,
                          }
                        : {}
                    }
                  >
                    <span className="category-icon">
                      <img
                        src={cat.icon}
                        alt={cat.name}
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "contain",
                        }}
                      />
                    </span>
                    <span className="category-name">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaires dynamiques */}
          {selectedCategory && (
            <div className="card form-card">
              <div className="card-header">
                <h2>
                  Canevas -{" "}
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </h2>
                <p className="card-description">
                  Remplissez les champs du modèle prédéfini
                </p>
              </div>
              <div className="card-content">
                {/* Formulaire Énergie */}
                {selectedCategory === "energie" && (
                  <div className="form-grid">
                    <YearDataEntry
                      data={energieData}
                      setData={setEnergieData}
                    />
                    <MonthDataEntry
                      data={energieData}
                      setData={setEnergieData}
                      mois={mois}
                    />
                    <SiteDataEntry
                      data={energieData}
                      setData={setEnergieData}
                      sites={sites}
                    />

                    <div className="form-group">
                      <label>Type *</label>
                      <select
                        value={energieData.type}
                        onChange={(e) =>
                          setEnergieData({
                            ...energieData,
                            type: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="Électricité">Électricité</option>
                        <option value="Gaz naturel">Gaz naturel</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Solaire">Solaire</option>
                        <option value="Biomasse">Biomasse</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Unité</label>
                      <select
                        value={energieData.unite}
                        onChange={(e) =>
                          setEnergieData({
                            ...energieData,
                            unite: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="kWh">kWh</option>
                        <option value="MWh">MWh</option>
                        <option value="Litres">Litres</option>
                        <option value="m³">m³</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Valeur</label>
                      <input
                        type="number"
                        value={energieData.valeur}
                        onChange={(e) =>
                          setEnergieData({
                            ...energieData,
                            valeur: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Formulaire Eau */}
                {selectedCategory === "eau" && (
                  <div className="form-grid">
                    <YearDataEntry data={eauData} setData={setEauData} />
                    <MonthDataEntry
                      data={eauData}
                      setData={setEauData}
                      mois={mois}
                    />
                    <SiteDataEntry
                      data={eauData}
                      setData={setEauData}
                      sites={sites}
                    />

                    <div className="form-group">
                      <label>Famille de culture</label>
                      <select
                        value={eauData.familleCulture}
                        onChange={(e) =>
                          setEauData({
                            ...eauData,
                            familleCulture: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="Céréales">Céréales</option>
                        <option value="Oléicole">Oléicole</option>
                        <option value="Fruits & Légumes">
                          Fruits & Légumes
                        </option>
                        <option value="Dattes">Dattes</option>
                        <option value="Plantes Aromatiques">
                          Plantes Aromatiques
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Variété</label>
                      <input
                        type="text"
                        value={eauData.variete}
                        onChange={(e) =>
                          setEauData({ ...eauData, variete: e.target.value })
                        }
                        placeholder="Ex: Tomate, Blé dur..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Volume d'eau (m³) *</label>
                      <input
                        type="number"
                        value={eauData.volumeEau}
                        onChange={(e) =>
                          setEauData({ ...eauData, volumeEau: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Formulaire Déchets */}
                {selectedCategory === "dechets" && (
                  <div className="form-grid">
                    <YearDataEntry
                      data={dechetsData}
                      setData={setDechetsData}
                    />
                    <MonthDataEntry
                      data={dechetsData}
                      setData={setDechetsData}
                      mois={mois}
                    />
                    <SiteDataEntry
                      data={dechetsData}
                      setData={setDechetsData}
                      sites={sites}
                    />

                    <div className="form-group">
                      <label>Catégorie déchets</label>
                      <select
                        value={dechetsData.categorie}
                        onChange={(e) =>
                          setDechetsData({
                            ...dechetsData,
                            categorie: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="Déchets organiques">
                          Déchets organiques
                        </option>
                        <option value="Plastiques">Plastiques</option>
                        <option value="Carton/Papier">Carton/Papier</option>
                        <option value="Métal">Métal</option>
                        <option value="Verre">Verre</option>
                        <option value="Déchets dangereux">
                          Déchets dangereux
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Unité</label>
                      <select
                        value={dechetsData.unite}
                        onChange={(e) =>
                          setDechetsData({
                            ...dechetsData,
                            unite: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="kg">Kilogrammes (kg)</option>
                        <option value="tonnes">Tonnes</option>
                        <option value="m³">Mètres cubes (m³)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Valeur *</label>
                      <input
                        type="number"
                        value={dechetsData.valeur}
                        onChange={(e) =>
                          setDechetsData({
                            ...dechetsData,
                            valeur: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Formulaire Social */}
                {selectedCategory === "social" && (
                  <div className="form-grid">
                    <YearDataEntry data={socialData} setData={setSocialData} />
                    <MonthDataEntry
                      data={socialData}
                      setData={setSocialData}
                      mois={mois}
                    />
                    <SiteDataEntry
                      data={socialData}
                      setData={setSocialData}
                      sites={sites}
                    />

                    <div className="form-group">
                      <label>Action *</label>
                      <select
                        value={socialData.action}
                        onChange={(e) =>
                          setSocialData({
                            ...socialData,
                            action: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="Formation professionnelle">
                          Formation professionnelle
                        </option>
                        <option value="Campagne santé">Campagne santé</option>
                        <option value="Soutien éducatif">
                          Soutien éducatif
                        </option>
                        <option value="Infrastructure communautaire">
                          Infrastructure communautaire
                        </option>
                        <option value="Création d'emplois">
                          Création d'emplois
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Budget (MAD)</label>
                      <input
                        type="number"
                        value={socialData.budget}
                        onChange={(e) =>
                          setSocialData({
                            ...socialData,
                            budget: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Nombre de bénéficiaires</label>
                      <input
                        type="number"
                        value={socialData.beneficiaires}
                        onChange={(e) =>
                          setSocialData({
                            ...socialData,
                            beneficiaires: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Formulaire Production */}
                {selectedCategory === "production" && (
                  <div className="form-grid">
                    <YearDataEntry
                      data={productionData}
                      setData={setProductionData}
                    />
                    <MonthDataEntry
                      data={productionData}
                      setData={setProductionData}
                      mois={mois}
                    />
                    <SiteDataEntry
                      data={productionData}
                      setData={setProductionData}
                      sites={sites}
                    />

                    <div className="form-group">
                      <label>Action *</label>
                      <select
                        value={productionData.action}
                        onChange={(e) =>
                          setProductionData({
                            ...productionData,
                            action: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="Achat semences">Achat semences</option>
                        <option value="Système irrigation">
                          Système irrigation
                        </option>
                        <option value="Engrais bio">Engrais bio</option>
                        <option value="Équipement agricole">
                          Équipement agricole
                        </option>
                        <option value="Certification bio">
                          Certification bio
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Budget (MAD)</label>
                      <input
                        type="number"
                        value={productionData.budget}
                        onChange={(e) =>
                          setProductionData({
                            ...productionData,
                            budget: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Nombre de bénéficiaires</label>
                      <input
                        type="number"
                        value={productionData.beneficiaires}
                        onChange={(e) =>
                          setProductionData({
                            ...productionData,
                            beneficiaires: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button className="btn-add" onClick={handleAddLine}>
                    <span>➕</span> Ajouter ligne
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tableau des entrées */}
          {entries.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="header-with-button">
                  <div>
                    <h2>Données saisies</h2>
                    <p className="card-description">
                      {entries.length} entrée(s) en attente de soumission
                    </p>
                  </div>
                  <button className="btn-submit" onClick={handleSubmit}>
                    ✓ Soumettre tout
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Catégorie</th>
                        <th>Année</th>
                        <th>Mois</th>
                        <th>Site</th>
                        <th>Détails</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id}>
                          <td>
                            <span className="category-badge">
                              {entry.category === "Énergie" && (
                                <img
                                  src={boltIcon}
                                  alt="Énergie"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    objectFit: "contain",
                                    marginRight: "6px",
                                    verticalAlign: "middle",
                                  }}
                                />
                              )}
                              {entry.category === "Eau" && (
                                <img
                                  src={waterIcon}
                                  alt="Eau"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    objectFit: "contain",
                                    marginRight: "6px",
                                    verticalAlign: "middle",
                                  }}
                                />
                              )}
                              {entry.category === "Déchets" && (
                                <img
                                  src={trashIcon}
                                  alt="Déchets"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    objectFit: "contain",
                                    marginRight: "6px",
                                    verticalAlign: "middle",
                                  }}
                                />
                              )}
                              {entry.category === "Social" && (
                                <img
                                  src={socialIcon}
                                  alt="Social"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    objectFit: "contain",
                                    marginRight: "6px",
                                    verticalAlign: "middle",
                                  }}
                                />
                              )}
                              {entry.category === "Production" && (
                                <img
                                  src={productionIcon}
                                  alt="Production"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    objectFit: "contain",
                                    marginRight: "6px",
                                    verticalAlign: "middle",
                                  }}
                                />
                              )}
                              {entry.category}
                            </span>
                          </td>
                          <td>{entry.annee}</td>
                          <td>{getMoisLabel(String(entry.mois))}</td>
                          <td>{getSiteLabel(String(entry.site))}</td>
                          <td className="details-cell">
                            {entry.category === "Énergie" &&
                              `${entry.type} - ${entry.unite || "N/A"} - ${entry.valeur || "N/A"}`}
                            {entry.category === "Eau" &&
                              `${entry.familleCulture || "N/A"} - ${
                                entry.variete || "N/A"
                              } - ${entry.volumeEau} m³`}
                            {entry.category === "Déchets" &&
                              `${entry.categorie || "N/A"} - ${entry.valeur} ${entry.unite || ""}`}
                            {entry.category === "Social" &&
                              `${entry.action} - ${entry.budget || "0"} MAD - ${
                                entry.beneficiaires || "0"
                              } bénéf.`}
                            {entry.category === "Production" &&
                              `${entry.action} - ${entry.budget || "0"} MAD - ${
                                entry.beneficiaires || "0"
                              } bénéf.`}
                          </td>
                          <td>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <img
                                src={deleteIcon}
                                alt="Delete"
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  objectFit: "contain",
                                }}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {saved && (
                  <div className="success-message">
                    <span>✓</span> Toutes les données ont été enregistrées avec
                    succès !
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CanevasPage;
