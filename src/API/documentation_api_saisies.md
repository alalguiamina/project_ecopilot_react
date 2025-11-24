**`documentation_api_saisies.md`**

````markdown
# 📚 Documentation API : Module Saisies RSE

Ce document détaille les endpoints, les formats de données et les règles métier pour le module de saisie des indicateurs environnementaux.

## 🌍 Base URL & Authentification
* **Base URL** : `/core/saisies/`
* **Authentification** : Requise pour tous les appels (Header `Authorization`).
* **Portée (Scope)** :
    * **ADMIN** : Accès à toutes les données.
    * **USER / AGENT / SUPERUSER** : Accès limité aux sites auxquels l'utilisateur est affecté.

---

## 1. 📋 Récupérer les Saisies (List & Detail)

**GET** `/core/saisies/`  
**GET** `/core/saisies/{id}/`

Récupère l'historique des rapports mensuels. Les valeurs (indicateurs) sont imbriquées dans la réponse.

### Exemple de Réponse (200 OK)
```json
[
  {
    "id": 12,
    "site": 5,
    "mois": 1,
    "annee": 2025,
    "statut": "en_attente", 
    "require_double_validation": true,
    "created_by": 1,
    "date_creation": "2025-01-15T10:00:00Z",
    "first_validation_by": null,
    "first_validation_date": null,
    "final_validation_by": null,
    "final_validation_date": null,
    "valeurs": [
      {
        "id": 101,
        "type_indicateur": 45,
        "valeur": 1500.50,
        "unite": "kWh"
      },
      {
        "id": 102,
        "type_indicateur": 46,
        "valeur": 200.00,
        "unite": "m3"
      }
    ]
  }
]
````

> **Note Front-end :** Le champ `require_double_validation` (booléen) vous permet de savoir si vous devez afficher une barre de progression à 1 ou 2 étapes dans l'interface.

-----

## 2\. 📝 Créer une Saisie (Create)

**POST** `/core/saisies/`

Permet de créer un rapport mensuel complet (Dossier + Lignes de valeurs) en une seule requête.

### Règles de Validation (Importantes)

1.  **Configuration du Site :** Vous ne pouvez envoyer que des `type_indicateur` autorisés pour le site sélectionné.
2.  **Champs Obligatoires :** Si un indicateur est marqué `obligatoire=True` dans la config du site, il **doit** être présent dans le tableau `valeurs`.
3.  **Unicité :** Il est impossible de créer deux saisies pour le même trio : `Site + Mois + Année`.

### Payload (JSON)

```json
{
  "site": 5,
  "mois": 2,
  "annee": 2025,
  "valeurs": [
    {
      "type_indicateur": 45, 
      "valeur": 1200.00,
      "unite": "kWh"
    },
    {
      "type_indicateur": 46,
      "valeur": 180.5,
      "unite": "m3"
    }
  ]
}
```

### Erreurs Fréquentes (400 Bad Request)

  * **Doublon :** `{"non_field_errors": ["Une saisie existe déjà pour ce site à cette date."]}`
  * **Manquant :** `{"non_field_errors": ["Les indicateurs obligatoires suivants sont manquants : ['Electricité']"]}`
  * **Intrus :** `{"non_field_errors": ["Les indicateurs suivants ne sont pas configurés pour ce site..."]}`

-----

## 3\. ✏️ Modifier une Saisie (Update)

**PATCH** `/core/saisies/{id}/`

Permet de corriger des valeurs ou de changer le mois/année.

### ⚠️ Comportement Critique

Si vous envoyez le champ `valeurs`, **la liste existante en base est supprimée et remplacée** par la nouvelle liste envoyée.

  * **Conséquence :** Le Front-end doit toujours renvoyer **toutes** les lignes du tableau, même celles qui n'ont pas changé.

### Verrouillage

La modification est **interdite** (400 Bad Request) si le statut de la saisie est différent de `en_attente`.

### Payload (Exemple)

```json
{
  "valeurs": [
    {
      "type_indicateur": 45,
      "valeur": 1300.00, // Correction de la valeur
      "unite": "kWh"
    },
    {
       "type_indicateur": 46,
       "valeur": 180.5, // Doit être renvoyé même si inchangé
       "unite": "m3"
    }
  ]
}
```

-----

## 4\. ✅ Workflow de Validation (Action)

**POST** `/core/saisies/{id}/validation/`

Endpoint dédié pour changer le statut (Valider ou Rejeter). Ne modifiez pas le champ `statut` directement via PATCH.

### Payload

```json
{
  "action": "valider" 
  // OU
  "action": "rejeter"
}
```

### Logique d'affichage des boutons (Matrice de droits)

Voici quand afficher les boutons d'action selon le rôle et le contexte :

| Statut Actuel | Rôle Utilisateur | Site à Double Validation ? | Action Possible | Nouvel État (si Valider) |
| :--- | :--- | :--- | :--- | :--- |
| **En attente** | ADMIN | Oui/Non | Valider / Rejeter | Validé (Admin bypass) |
| **En attente** | USER | **Oui** | Valider / Rejeter | Validé Partiellement |
| **En attente** | USER | **Non** | Valider / Rejeter | Validé |
| **En attente** | SUPERUSER | Non | Valider / Rejeter | Validé |
| **Validé Partiellement** | SUPERUSER | **Oui** | Valider / Rejeter | Validé |
| *Autres cas* | *Tout le monde* | *Peu importe* | *Aucune action* | - |

> 🚫 **Note :** Les utilisateurs ayant le rôle **AGENT** ne peuvent jamais valider. Ils peuvent uniquement créer (POST) ou modifier (PATCH).

-----

## 💡 Algorithme pour le Formulaire Front-end

Pour générer le formulaire de saisie dynamiquement :

1.  L'utilisateur choisit un **Site** dans une liste déroulante.
2.  Le Front appelle l'API de configuration (ex: `/core/sites/{id}/config/`).
3.  Le Back renvoie la liste des indicateurs actifs pour ce site + un booléen `obligatoire`.
4.  Le Front génère les champs de saisie (`input type="number"`) basés sur cette liste.
5.  Le Front poste le JSON complet vers `/core/saisies/`.

<!-- end list -->

```
```