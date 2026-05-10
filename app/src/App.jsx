import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

const STORAGE_KEY = "reperes-um-2-cadre-v3-charge-attribution";
const EQUIPE_STORAGE_KEY = "reperes-um-2-cadre-equipe-v1";

const equipeInitiale = [
  { code: "IDE-01", metier: "IDE", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
  { code: "IDE-02", metier: "IDE", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
  { code: "IDE-03", metier: "IDE", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
  { code: "EDU-01", metier: "EDUC", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
  { code: "EDU-02", metier: "EDUC", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
  { code: "EDU-03", metier: "EDUC", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
  { code: "NEURO-01", metier: "NEUROPSY", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
  { code: "NEURO-02", metier: "NEUROPSY", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
  { code: "PSYMO-01", metier: "AUTRE", presence: "présente", typeAbsence: "", dateDebutAbsence: "", dateFinAbsence: "", disponibilitePct: "100", retourConfirme: false, commentaireAbsence: "" },
];

const metiers = ["IDE", "EDUC", "NEUROPSY", "AUTRE"];

function normaliserEquipe(equipeSauvee) {
  if (!Array.isArray(equipeSauvee)) return equipeInitiale;

  const codesInitiaux = new Set(equipeInitiale.map((pro) => pro.code));

  const base = equipeInitiale.map((pro) => ({
    ...pro,
    ...(equipeSauvee.find((item) => item.code === pro.code) || {}),
  }));

  const ajouts = equipeSauvee.filter((item) => item?.code && !codesInitiaux.has(item.code));

  return [...base, ...ajouts];
}

function creerMembreEquipe(code, metier) {
  return {
    code: code.trim().toUpperCase(),
    metier,
    presence: "présente",
    typeAbsence: "",
    dateDebutAbsence: "",
    dateFinAbsence: "",
    disponibilitePct: "100",
    retourConfirme: false,
    commentaireAbsence: "",
  };
}


const statuts = [
  "Demande reçue",
  "En attente éléments ESMS",
  "Délai suspendu",
  "Analyse en cours",
  "Analyse réalisée — non prise en charge",
  "Acceptée — signature à programmer",
  "Signature programmée",
  "Situation effective en cours",
  "Mi-parcours à surveiller",
  "Synthèse à préparer",
  "Prolongation à arbitrer",
  "En clôture",
  "Clôturée",
];

const presences = ["présente", "absence planifiée", "arrêt maladie", "absence imprévue", "disponibilité réduite"];
const typesAbsence = ["", "congé planifié", "formation", "arrêt maladie", "absence imprévue", "autre absence cadre"];
const modalites = ["Structure", "VAD", "Mixte", "Non défini"];
const periodesTrajet = ["Non renseigné", "Heures creuses", "Heures de pointe", "Variable"];
const VINATIER_ADRESSE_TRAJET = "Centre Hospitalier Le Vinatier, 95 boulevard Pinel, 69500 Bron";
const STRUCTURES_TRAJET_STORAGE_KEY = "pilotage-um-structures-trajet-v1";

const structuresTrajetInitiales = [
  { code: "MAS-01", nom: "", adresse: "", codePostal: "", ville: "" },
  { code: "MAS-02", nom: "", adresse: "", codePostal: "", ville: "" },
  { code: "MAS-03", nom: "", adresse: "", codePostal: "", ville: "" },
  { code: "FAM-01", nom: "", adresse: "", codePostal: "", ville: "" },
  { code: "IME-01", nom: "", adresse: "", codePostal: "", ville: "" },
  { code: "ESMS-01", nom: "", adresse: "", codePostal: "", ville: "" },
];

function normaliserStructuresTrajet(liste) {
  if (!Array.isArray(liste)) return structuresTrajetInitiales;
  const nettoyees = liste
    .map((structure) => ({
      code: String(structure.code || "").toUpperCase().replace(/\s+/g, ""),
      nom: String(structure.nom || ""),
      adresse: String(structure.adresse || ""),
      codePostal: String(structure.codePostal || ""),
      ville: String(structure.ville || ""),
    }))
    .filter((structure) => structure.code);
  return nettoyees.length ? nettoyees : structuresTrajetInitiales;
}

function adresseCompleteStructure(structure) {
  return [structure.adresse, structure.codePostal, structure.ville].filter(Boolean).join(", ");
}

const circulations = ["Non renseigné", "fluide", "modérée", "dense", "très dense"];
const mobilisations = ["faible", "modéré", "élevé", "très élevé"];
const coordinations = ["simple", "régulier", "complexe", "très complexe"];
const alertes = ["aucune", "bleue", "orange", "rouge"];
const intensitesRelais = ["aucun", "vigilance", "actif", "complet temporaire"];

const objectifsSignature = [
  { id: "finalite", categorie: "Finalité", texte: "Clarifier la finalité de l’accompagnement UM avec l’ESMS et les professionnels impliqués." },
  { id: "comportements-cibles", categorie: "Comportements ciblés", texte: "Identifier les situations qui nécessitent une observation partagée et des réponses harmonisées." },
  { id: "evaluation", categorie: "Évaluation", texte: "Préciser les éléments à observer et les indicateurs simples d’évolution pendant le parcours." },
  { id: "soin", categorie: "Soin / coordination", texte: "Faciliter la coordination entre les professionnels concernés sans se substituer aux suivis existants." },
  { id: "orientation", categorie: "Orientation", texte: "Repérer les besoins d’orientation ou d’ajustement à discuter avec les partenaires concernés." },
  { id: "communication", categorie: "Communication", texte: "Soutenir des modalités de communication plus lisibles, partagées et adaptées au quotidien." },
  { id: "emotions", categorie: "Émotions", texte: "Aider l’équipe à repérer les signaux de tension et les stratégies d’apaisement utiles." },
  { id: "habiletes-sociales", categorie: "Habiletés sociales", texte: "Observer les interactions et soutenir les ajustements favorisant la participation." },
  { id: "vie-quotidienne", categorie: "Vie quotidienne", texte: "Repérer les aménagements utiles dans les temps de vie quotidienne." },
  { id: "journee-type", categorie: "Journée type", texte: "Analyser l’organisation de la journée type et les moments sensibles à anticiper." },
  { id: "harmonisation", categorie: "Harmonisation des pratiques", texte: "Favoriser une réponse d’équipe cohérente, partagée et sécurisante." },
  { id: "outils", categorie: "Outils à réactualiser", texte: "Identifier les outils existants à actualiser, simplifier ou réexpliquer à l’équipe." },
];


const formInitial = {
  codeSuffixe: "",
  referentCode: "",
  binomeCode: "",
  statut: "Demande reçue",
  modalite: "Non défini",

  dateSollicitation: "",
  dateDemandeComplementESMS: "",
  dateRetourESMS: "",
  dateAcceptationUM: "",
  dateSignature: "",
  dateSyntheseRealisee: "",
  dateFinReelle: "",

  delaiSuspendu: false,
  motifDelaiSuspendu: "",
  prolongation: false,
  dateDecisionProlongation: "",

  trajetKm: "",
  trajetMinutes: "",
  periodeTrajet: "Non renseigné",
  circulation: "Non renseigné",
  vadParSemaine: "0",
  niveauMobilisation: "modéré",
  niveauCoordination: "simple",
  alerte: "aucune",

  relaisCode: "",
  relaisDebut: "",
  relaisFin: "",
  relaisIntensite: "aucun",
  historiqueCadre: "",

  commentaire: "",
};

function dateLocale(date) {
  if (!date) return "—";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}

function aujourdHuiISO() {
  return new Date().toISOString().slice(0, 10);
}

function ajouterJours(date, jours) {
  if (!date) return "";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + jours);
  return d.toISOString().slice(0, 10);
}

function joursAvant(date) {
  if (!date) return null;
  const cible = new Date(`${date}T12:00:00`);
  const maintenant = new Date();
  maintenant.setHours(12, 0, 0, 0);
  if (Number.isNaN(cible.getTime())) return null;
  return Math.ceil((cible - maintenant) / (1000 * 60 * 60 * 24));
}

function joursEntre(debut, fin) {
  if (!debut || !fin) return "";
  const d1 = new Date(`${debut}T12:00:00`);
  const d2 = new Date(`${fin}T12:00:00`);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return "";
  return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
}

function dateDansIntervalle(date, debut, fin) {
  if (!date || !debut) return false;
  const cible = new Date(`${date}T12:00:00`).getTime();
  const d1 = new Date(`${debut}T12:00:00`).getTime();
  const d2 = fin ? new Date(`${fin}T12:00:00`).getTime() : Infinity;
  if (Number.isNaN(cible) || Number.isNaN(d1)) return false;
  return cible >= d1 && cible <= d2;
}

function formaterCode(numero) {
  const propre = String(numero || "").replace(/\D/g, "");
  if (!propre) return "";
  return `UM-2026-${propre.padStart(3, "0")}`;
}

function suffixeDepuisCode(code) {
  return String(code || "").replace("UM-2026-", "").replace(/\D/g, "");
}

function getPro(equipe, code) {
  return equipe.find((pro) => pro.code === code);
}

function estCloturee(situation) {
  return situation.statut === "Clôturée";
}

function estAnalyseNonRetenue(situation) {
  return situation.statut === "Analyse réalisée — non prise en charge";
}

function estEffective(situation) {
  if (estCloturee(situation) || estAnalyseNonRetenue(situation)) return false;
  return Boolean(situation.dateSignature);
}

function estPreparatoire(situation) {
  return !estEffective(situation) && !estCloturee(situation) && !estAnalyseNonRetenue(situation);
}

function parcours(situation) {
  if (!situation.dateSignature) {
    return {
      demarre: false,
      miParcours: "",
      syntheseProgrammee: "",
      finTheorique: "",
    };
  }

  return {
    demarre: true,
    miParcours: ajouterJours(situation.dateSignature, 45),
    syntheseProgrammee: ajouterJours(situation.dateSignature, 75),
    finTheorique: ajouterJours(situation.dateSignature, 90),
  };
}

function dansLesXJours(date, jours) {
  const j = joursAvant(date);
  return j !== null && j >= 0 && j <= jours;
}

function sortieSous(situation, jours) {
  if (!estEffective(situation) || estCloturee(situation)) return false;
  const p = parcours(situation);
  return dansLesXJours(p.finTheorique, jours);
}

function alerteParcours(situation) {
  if (estCloturee(situation) || estAnalyseNonRetenue(situation)) return null;

  if (situation.delaiSuspendu) return "Délai suspendu";
  if (situation.prolongation || situation.statut === "Prolongation à arbitrer") {
    return "Prolongation à arbitrer";
  }

  const p = parcours(situation);

  if (!p.demarre) {
    if (dansLesXJours(situation.dateSignature, 7)) return "Signature cette semaine";
    return null;
  }

  const jFin = joursAvant(p.finTheorique);
  if (jFin !== null && jFin < 0 && !situation.dateFinReelle) return "Fin théorique dépassée";
  if (dansLesXJours(p.finTheorique, 15)) return "Fin prévue sous 15 jours";
  if (dansLesXJours(p.syntheseProgrammee, 7)) return "Synthèse à J-7";
  if (dansLesXJours(p.miParcours, 7)) return "Mi-parcours à J-7";

  return null;
}

function scoreStatut(statut) {
  switch (statut) {
    case "Demande reçue":
    case "En attente éléments ESMS":
    case "Délai suspendu":
      return 0.5;
    case "Analyse en cours":
      return 1;
    case "Analyse réalisée — non prise en charge":
      return 1.5;
    case "Acceptée — signature à programmer":
      return 1;
    case "Signature programmée":
      return 1.5;
    case "Situation effective en cours":
    case "Mi-parcours à surveiller":
      return 3;
    case "Synthèse à préparer":
      return 2.5;
    case "Prolongation à arbitrer":
      return 3.5;
    case "En clôture":
      return 1.5;
    case "Clôturée":
      return 0;
    default:
      return 0;
  }
}

function scoreTrajet(minutes) {
  const trajet = Number(minutes || 0);
  if (trajet > 90) return 3;
  if (trajet >= 60) return 2;
  if (trajet >= 30) return 1;
  return 0;
}

function scoreNiveau(valeur) {
  switch (valeur) {
    case "simple":
    case "faible":
      return valeur === "simple" ? 0.5 : 0;
    case "régulier":
    case "modéré":
      return 1;
    case "complexe":
    case "élevé":
      return 2;
    case "très complexe":
    case "très élevé":
      return 3;
    default:
      return 0;
  }
}

function scoreAlerte(alerte) {
  if (alerte === "rouge") return 3;
  if (alerte === "orange") return 1;
  return 0;
}

function bonusSortieProche(situation) {
  const p = parcours(situation);
  if (!p.finTheorique) return 0;
  if (dansLesXJours(p.finTheorique, 7)) return -2;
  if (dansLesXJours(p.finTheorique, 15)) return -1;
  if (dansLesXJours(p.finTheorique, 30)) return -0.5;
  return 0;
}

function scoreRelais(situation) {
  switch (situation.relaisIntensite) {
    case "vigilance":
      return 1;
    case "actif":
      return 2;
    case "complet temporaire":
      return 3;
    default:
      return 0;
  }
}

function calculerScoreSituation(situation) {
  return Math.max(
    0,
    scoreStatut(situation.statut) +
      scoreTrajet(situation.trajetMinutes) +
      Number(situation.vadParSemaine || 0) +
      scoreNiveau(situation.niveauMobilisation) +
      scoreNiveau(situation.niveauCoordination) +
      (situation.prolongation ? 2 : 0) +
      scoreAlerte(situation.alerte) +
      bonusSortieProche(situation)
  );
}

function scoreSituationPourPro(situation, codePro) {
  const base = calculerScoreSituation(situation);
  if (situation.relaisCode === codePro && situation.relaisIntensite !== "aucun") {
    return base + scoreRelais(situation);
  }
  return base;
}

function lectureScore(score) {
  if (score >= 16) return "Point cadre à discuter";
  if (score >= 11) return "Vigilance renforcée";
  if (score >= 6) return "Vigilance simple";
  return "Marge projetée favorable";
}

function statutDisponibilite(pro, dateReference = aujourdHuiISO()) {
  if (!pro) return { proposable: false, vigilance: "Professionnelle non codée", facteur: 99 };

  const presence = pro.presence || "présente";
  const pct = Math.max(1, Number(pro.disponibilitePct || 100)) / 100;
  const absenceActive = dateDansIntervalle(dateReference, pro.dateDebutAbsence, pro.dateFinAbsence);

  if (presence === "arrêt maladie") {
    if (!pro.retourConfirme) {
      return {
        proposable: false,
        vigilance: "Arrêt maladie : retour non confirmé. Non proposée.",
        facteur: 99,
      };
    }

    if (absenceActive) {
      return {
        proposable: false,
        vigilance: "Arrêt maladie encore active sur la période. Non proposée.",
        facteur: 99,
      };
    }

    return {
      proposable: true,
      vigilance: "Retour confirmé : proposition possible avec vigilance cadre.",
      facteur: 1,
    };
  }

  if (presence === "absence imprévue") {
    return {
      proposable: false,
      vigilance: "Absence imprévue : situation non clarifiée. Non proposée.",
      facteur: 99,
    };
  }

  if (presence === "absence planifiée") {
    if (absenceActive) {
      return {
        proposable: false,
        vigilance: "Absence planifiée couvrant la période. Non proposée.",
        facteur: 99,
      };
    }

    return {
      proposable: true,
      vigilance: pro.dateFinAbsence ? "Absence planifiée hors période de démarrage." : "Absence planifiée à vérifier.",
      facteur: 1,
    };
  }

  if (presence === "disponibilité réduite") {
    return {
      proposable: true,
      vigilance: `Disponibilité réduite ${Math.round(pct * 100)} %. Score ajusté.`,
      facteur: 1 / pct,
    };
  }

  return { proposable: true, vigilance: "Présence renseignée.", facteur: 1 };
}

function badgeClasse(type) {
  if (type === "effective") return "badge badgeVert";
  if (type === "avenir") return "badge badgeBleu";
  if (type === "alerte") return "badge badgeOrange";
  if (type === "retard") return "badge badgeRouge";
  return "badge badgeGris";
}

function telechargerFichier(nom, contenu, type) {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nom;
  lien.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const texte = String(value ?? "");
  return `"${texte.replaceAll('"', '""')}"`;
}


async function geocoderAdresseTemporaire(adresse) {
  const propre = String(adresse || "").trim();
  if (!propre) throw new Error("Adresse temporaire manquante.");

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("countrycodes", "fr");
  url.searchParams.set("q", propre);

  const reponse = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!reponse.ok) throw new Error("Recherche d’adresse impossible.");
  const resultats = await reponse.json();
  if (!Array.isArray(resultats) || resultats.length === 0) {
    throw new Error("Adresse non trouvée. Préciser la commune ou le code postal.");
  }

  return {
    lat: Number(resultats[0].lat),
    lon: Number(resultats[0].lon),
  };
}

async function calculerTrajetTemporaire(depart, destination) {
  const pointDepart = await geocoderAdresseTemporaire(depart);
  const pointDestination = await geocoderAdresseTemporaire(destination);

  const url = `https://router.project-osrm.org/route/v1/driving/${pointDepart.lon},${pointDepart.lat};${pointDestination.lon},${pointDestination.lat}?overview=false&alternatives=false&steps=false`;
  const reponse = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!reponse.ok) throw new Error("Calcul de trajet impossible.");
  const donnees = await reponse.json();
  const route = donnees?.routes?.[0];

  if (!route) throw new Error("Aucun itinéraire trouvé.");

  return {
    km: Math.round((route.distance / 1000) * 10) / 10,
    minutes: Math.round(route.duration / 60),
  };
}

export default function App() {
  const [situations, setSituations] = useState(() => {
    try {
      const sauvegarde = localStorage.getItem(STORAGE_KEY);
      return sauvegarde ? JSON.parse(sauvegarde) : [];
    } catch {
      return [];
    }
  });

  const [equipe, setEquipe] = useState(() => {
    try {
      const sauvegarde = localStorage.getItem(EQUIPE_STORAGE_KEY);
      if (!sauvegarde) return equipeInitiale;
      const equipeSauvee = JSON.parse(sauvegarde);
      return normaliserEquipe(equipeSauvee);
    } catch {
      return equipeInitiale;
    }
  });

  const [form, setForm] = useState(formInitial);
  const [editingId, setEditingId] = useState(null);
  const [metierAttribution, setMetierAttribution] = useState("IDE");
  const [dateNouvelleAttribution, setDateNouvelleAttribution] = useState("");
  const [nouveauMembre, setNouveauMembre] = useState({ code: "", metier: "IDE" });
  const [objectifSituationCode, setObjectifSituationCode] = useState("");
  const [objectifsSelectionnes, setObjectifsSelectionnes] = useState([]);
  const [commentaireObjectifs, setCommentaireObjectifs] = useState("");
  const [trajetTemp, setTrajetTemp] = useState({
    depart: VINATIER_ADRESSE_TRAJET,
    destination: "",
    chargement: false,
    message: "",
  });
  const [structuresTrajet, setStructuresTrajet] = useState(() => {
    try {
      const sauvegarde = localStorage.getItem(STRUCTURES_TRAJET_STORAGE_KEY);
      return sauvegarde ? normaliserStructuresTrajet(JSON.parse(sauvegarde)) : structuresTrajetInitiales;
    } catch {
      return structuresTrajetInitiales;
    }
  });
  const [afficherFormStructureTrajet, setAfficherFormStructureTrajet] = useState(false);
  const [structureTrajetForm, setStructureTrajetForm] = useState({
    code: "",
    nom: "",
    adresse: "",
    codePostal: "",
    ville: "",
  });
  const [structureTrajetSelection, setStructureTrajetSelection] = useState("");
  const importJsonRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(situations));
  }, [situations]);

  useEffect(() => {
    localStorage.setItem(EQUIPE_STORAGE_KEY, JSON.stringify(equipe));
  }, [equipe]);

  useEffect(() => {
    localStorage.setItem(STRUCTURES_TRAJET_STORAGE_KEY, JSON.stringify(structuresTrajet));
  }, [structuresTrajet]);

  const dateAttributionReference = dateNouvelleAttribution || aujourdHuiISO();

  const prosAbsentsActifs = useMemo(() => {
    return equipe.filter((pro) => {
      const dispo = statutDisponibilite(pro, aujourdHuiISO());
      return !dispo.proposable && pro.presence !== "absence planifiée";
    });
  }, [equipe]);

  const situationsASeecuriser = useMemo(() => {
    const codesAbsents = new Set(prosAbsentsActifs.map((pro) => pro.code));
    return situations.filter(
      (s) =>
        !estCloturee(s) &&
        !estAnalyseNonRetenue(s) &&
        (codesAbsents.has(s.referentCode) || codesAbsents.has(s.binomeCode)) &&
        !s.relaisCode
    );
  }, [situations, prosAbsentsActifs]);

  const synthese = useMemo(() => {
    const effectives = situations.filter((s) => estEffective(s) && !estCloturee(s));
    const preparatoires = situations.filter(estPreparatoire);
    const cloturees = situations.filter(estCloturee);
    const nonRetenues = situations.filter(estAnalyseNonRetenue);
    const sorties15 = situations.filter((s) => sortieSous(s, 15));
    const alertesParcours = situations.filter(alerteParcours);
    const prolongations = situations.filter((s) => s.prolongation || s.statut === "Prolongation à arbitrer");
    const absences = equipe.filter((pro) => pro.presence !== "présente").length;

    return {
      total: situations.length,
      totalActif: effectives.length + preparatoires.length,
      effectives: effectives.length,
      preparatoires: preparatoires.length,
      cloturees: cloturees.length,
      nonRetenues: nonRetenues.length,
      sorties15: sorties15.length,
      alertesParcours: alertesParcours.length,
      prolongations: prolongations.length,
      absences,
      relaisASecuriser: situationsASeecuriser.length,
    };
  }, [situations, equipe, situationsASeecuriser]);

  const indicateursBilan = useMemo(() => {
    const joursValides = (liste) =>
      liste.map((valeur) => Number(valeur)).filter((nombre) => Number.isFinite(nombre) && nombre >= 0);

    const moyenne = (liste) => {
      if (liste.length === 0) return "—";
      return (liste.reduce((total, nombre) => total + nombre, 0) / liste.length).toFixed(1);
    };

    const delaisTotaux = joursValides(
      situations.map((s) => joursEntre(s.dateSollicitation, s.dateSignature))
    );

    const delaisSuspendus = joursValides(
      situations.map((s) => joursEntre(s.dateDemandeComplementESMS, s.dateRetourESMS))
    );

    const delaisUM = delaisTotaux.map((delai, index) => Math.max(0, delai - Number(delaisSuspendus[index] || 0)));

    const dureesParcours = joursValides(
      situations.map((s) => joursEntre(s.dateSignature, s.dateFinReelle || s.dateFinTheorique))
    );

    const vadTotal = situations.reduce((total, s) => total + Number(s.vadParSemaine || 0), 0);
    const kmMoyens = joursValides(situations.map((s) => s.trajetKm));
    const minutesMoyennes = joursValides(situations.map((s) => s.trajetMinutes));

    return {
      total: situations.length,
      effectives: situations.filter((s) => estEffective(s) && !estCloturee(s)).length,
      preparatoires: situations.filter(estPreparatoire).length,
      cloturees: situations.filter(estCloturee).length,
      nonRetenues: situations.filter(estAnalyseNonRetenue).length,
      prolongations: situations.filter((s) => s.prolongation || s.statut === "Prolongation à arbitrer").length,
      delaiTotalMoyen: moyenne(delaisTotaux),
      delaiUMMoyen: moyenne(delaisUM),
      dureeMoyenne: moyenne(dureesParcours),
      vadTotal,
      kmMoyens: moyenne(kmMoyens),
      minutesMoyennes: moyenne(minutesMoyennes),
      modaliteVad: situations.filter((s) => s.modalite === "VAD").length,
      modaliteStructure: situations.filter((s) => s.modalite === "structure").length,
      modaliteMixte: situations.filter((s) => s.modalite === "mixte").length,
    };
  }, [situations]);

  const chargeProfessionnels = useMemo(() => {
    return equipe.map((pro) => {
      const liste = situations.filter(
        (s) =>
          !estCloturee(s) &&
          !estAnalyseNonRetenue(s) &&
          (s.referentCode === pro.code || s.binomeCode === pro.code || s.relaisCode === pro.code)
      );

      const scoreBrut = liste.reduce((total, situation) => total + scoreSituationPourPro(situation, pro.code), 0);
      const dispo = statutDisponibilite(pro, dateAttributionReference);
      const scoreAjuste = dispo.proposable ? scoreBrut * dispo.facteur : Infinity;

      return {
        ...pro,
        disponibiliteLecture: dispo.vigilance,
        proposable: dispo.proposable,
        scoreAjuste,
        effectives: liste.filter(estEffective).length,
        preparatoires: liste.filter(estPreparatoire).length,
        sorties15: liste.filter((s) => sortieSous(s, 15)).length,
        vadSemaine: liste.reduce((total, s) => total + Number(s.vadParSemaine || 0), 0),
        trajetsEleves: liste.filter((s) => Number(s.trajetMinutes || 0) >= 60).length,
        alertes: liste.filter(alerteParcours).length,
        relaisPortes: liste.filter((s) => s.relaisCode === pro.code && s.relaisIntensite !== "aucun").length,
        score: scoreBrut,
        lecture: dispo.proposable ? lectureScore(scoreAjuste) : "Non proposée",
      };
    });
  }, [situations, equipe, dateAttributionReference]);

  const propositionAttribution = useMemo(() => {
    const candidats = chargeProfessionnels.filter((item) => item.metier === metierAttribution);

    if (candidats.length === 0) {
      return {
        message: "Aucune professionnelle codée pour ce métier.",
        classement: [],
      };
    }

    const proposables = candidats.filter((item) => item.proposable);

    if (proposables.length === 0) {
      return {
        message: "Aucune professionnelle proposable sur cette période. Continuité à arbitrer par Michèle.",
        classement: candidats,
      };
    }

    const classement = [...proposables].sort((a, b) => a.scoreAjuste - b.scoreAjuste);

    if (classement.length === 1) {
      return {
        proposee: classement[0],
        classement: candidats,
        message:
          "Professionnelle unique proposable sur cette fonction. Attribution non arbitrable par comparaison métier. Charge à surveiller.",
      };
    }

    return {
      proposee: classement[0],
      classement: candidats,
      message:
        "Professionnelle proposée pour rééquilibrage. Validation cadre par Michèle nécessaire.",
    };
  }, [chargeProfessionnels, metierAttribution]);

  const objectifsParCategorie = useMemo(() => {
    return objectifsSignature.reduce((groupes, objectif) => {
      if (!groupes[objectif.categorie]) groupes[objectif.categorie] = [];
      groupes[objectif.categorie].push(objectif);
      return groupes;
    }, {});
  }, []);

  const texteObjectifsSignature = useMemo(() => {
    const selection = objectifsSignature.filter((objectif) => objectifsSelectionnes.includes(objectif.id));

    if (selection.length === 0 && !commentaireObjectifs.trim()) {
      return "Sélectionner un ou plusieurs objectifs pour générer une base de rédaction.";
    }

    const lignes = [
      objectifSituationCode ? `Situation codée : ${objectifSituationCode}` : "Situation codée : à renseigner",
      "",
      "Objectifs proposés pour la signature :",
      ...selection.map((objectif) => `- ${objectif.texte}`),
    ];

    if (commentaireObjectifs.trim()) {
      lignes.push("", `Précision cadre courte : ${commentaireObjectifs.trim()}`);
    }

    lignes.push("", "Formulation à valider en réunion de signature. L’outil aide à formuler, il ne décide pas.");

    return lignes.join("\\n");
  }, [objectifSituationCode, objectifsSelectionnes, commentaireObjectifs]);

  function basculerObjectif(id) {
    setObjectifsSelectionnes((actuels) =>
      actuels.includes(id) ? actuels.filter((item) => item !== id) : [...actuels, id]
    );
  }

  async function copierObjectifsSignature() {
    try {
      await navigator.clipboard.writeText(texteObjectifsSignature);
      window.alert("Objectifs copiés dans le presse-papiers.");
    } catch {
      window.alert("Copie impossible automatiquement. Le texte peut être sélectionné manuellement.");
    }
  }

  function modifierForm(champ, valeur) {
    setForm((actuel) => ({
      ...actuel,
      [champ]: valeur,
    }));
  }

  function modifierSituationDirecte(id, champ, valeur) {
    setSituations((actuelles) =>
      actuelles.map((situation) =>
        situation.id === id
          ? {
              ...situation,
              [champ]: valeur,
              modifieLe: new Date().toISOString(),
            }
          : situation
      )
    );
  }


  function modifierStructureTrajetForm(champ, valeur) {
    setStructureTrajetForm((actuelle) => ({
      ...actuelle,
      [champ]: champ === "code" ? valeur.toUpperCase().replace(/\s+/g, "") : valeur,
    }));
  }

  function enregistrerStructureTrajet() {
    const structure = {
      code: structureTrajetForm.code.trim().toUpperCase().replace(/\s+/g, ""),
      nom: structureTrajetForm.nom.trim(),
      adresse: structureTrajetForm.adresse.trim(),
      codePostal: structureTrajetForm.codePostal.trim(),
      ville: structureTrajetForm.ville.trim(),
    };

    if (!structure.code) {
      window.alert("Code structure obligatoire, par exemple MAS-01 ou ESMS-01.");
      return;
    }

    if (!structure.adresse || !structure.ville) {
      window.alert("Adresse et ville sont nécessaires pour le calcul trajet.");
      return;
    }

    setStructuresTrajet((actuelles) => {
      const sansDoublon = actuelles.filter((item) => item.code !== structure.code);
      return [...sansDoublon, structure].sort((a, b) => a.code.localeCompare(b.code));
    });

    setStructureTrajetForm({ code: "", nom: "", adresse: "", codePostal: "", ville: "" });
    setStructureTrajetSelection(structure.code);
    setAfficherFormStructureTrajet(false);
    setTrajetTemp((actuel) => ({
      ...actuel,
      message: `${structure.code} enregistrée dans le carnet structures.`,
    }));
  }

  function modifierStructureTrajetExistante(code) {
    const structure = structuresTrajet.find((item) => item.code === code);
    if (!structure) return;

    setStructureTrajetForm({
      code: structure.code,
      nom: structure.nom || "",
      adresse: structure.adresse || "",
      codePostal: structure.codePostal || "",
      ville: structure.ville || "",
    });
    setAfficherFormStructureTrajet(true);
  }

  function utiliserStructureTrajet(code) {
    const structure = structuresTrajet.find((item) => item.code === code);
    if (!structure) return;

    setStructureTrajetSelection(code);
    const adresse = adresseCompleteStructure(structure);
    if (!adresse) {
      setTrajetTemp((actuel) => ({
        ...actuel,
        message: `${structure.code} : adresse structure à compléter avant calcul.`,
      }));
      return;
    }

    setTrajetTemp((actuel) => ({
      ...actuel,
      depart: VINATIER_ADRESSE_TRAJET,
      destination: adresse,
      message: `${structure.code} sélectionnée pour le calcul trajet.`,
    }));
  }

  function modifierTrajetTemp(champ, valeur) {
    setTrajetTemp((actuel) => ({
      ...actuel,
      [champ]: valeur,
      message: champ === "message" ? valeur : actuel.message,
    }));
  }

  async function lancerCalculTrajetTemporaire() {
    const depart = VINATIER_ADRESSE_TRAJET;
    const destination = trajetTemp.destination.trim();

    if (!destination) {
      setTrajetTemp((actuel) => ({
        ...actuel,
        depart,
        message: "Renseigner l’adresse du lieu. Le départ est fixé au Vinatier.",
      }));
      return;
    }

    setTrajetTemp((actuel) => ({
      ...actuel,
      chargement: true,
      message: "Calcul du trajet en cours…",
    }));

    try {
      const resultat = await calculerTrajetTemporaire(depart, destination);

      setForm((actuel) => ({
        ...actuel,
        trajetKm: String(resultat.km),
        trajetMinutes: String(resultat.minutes),
        periodeTrajet: actuel.periodeTrajet || "Variable",
      }));

      setTrajetTemp({
        depart: VINATIER_ADRESSE_TRAJET,
        destination: "",
        chargement: false,
        message: `Trajet estimé : ${resultat.km} km aller · ${resultat.minutes} min aller. L’adresse du lieu a été effacée.`,
      });
    } catch (erreur) {
      setTrajetTemp((actuel) => ({
        ...actuel,
        chargement: false,
        destination: "",
        message: `${erreur?.message || "Calcul impossible."} L’adresse du lieu a été effacée.`,
      }));
    }
  }

  function effacerAdressesTrajetTemporaire() {
    setTrajetTemp({
      depart: VINATIER_ADRESSE_TRAJET,
      destination: "",
      chargement: false,
      message: "Adresse du lieu effacée. Le départ reste fixé au Vinatier.",
    });
  }


  function modifierPro(code, champ, valeur) {
    setEquipe((actuelle) =>
      actuelle.map((pro) => {
        if (pro.code !== code) return pro;
        const maj = { ...pro, [champ]: valeur };

        if (champ === "presence" && valeur === "présente") {
          maj.typeAbsence = "";
          maj.dateDebutAbsence = "";
          maj.dateFinAbsence = "";
          maj.disponibilitePct = "100";
          maj.retourConfirme = false;
        }

        if (champ === "presence" && valeur === "disponibilité réduite" && !maj.disponibilitePct) {
          maj.disponibilitePct = "50";
        }

        if (champ === "presence" && valeur === "arrêt maladie") {
          maj.typeAbsence = "arrêt maladie";
          maj.retourConfirme = false;
        }

        return maj;
      })
    );
  }


  function prefixeDepuisMetier(metier) {
    return String(metier || "AG")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6) || "AG";
  }

  function genererCodeMembre(metier) {
    const prefixe = prefixeDepuisMetier(metier);
    const numerosExistants = equipe
      .map((pro) => {
        const match = String(pro.code || "").match(new RegExp(`^${prefixe}-(\\d{2})-[A-Z]$`));
        return match ? Number(match[1]) : 0;
      })
      .filter(Boolean);

    const prochainNumero = Math.max(0, ...numerosExistants) + 1;
    return `${prefixe}-${String(prochainNumero).padStart(2, "0")}-E`;
  }

  function modifierNouveauMembre(champ, valeur) {
    setNouveauMembre((actuel) => {
      if (champ === "metier") {
        const codeActuel = String(actuel.code || "").trim();
        const codeAutoOuVide = !codeActuel || /^[A-Z0-9]{1,6}-\d{2}-[A-Z]$/.test(codeActuel);

        return {
          ...actuel,
          metier: valeur,
          code: codeAutoOuVide ? genererCodeMembre(valeur) : codeActuel,
        };
      }

      return {
        ...actuel,
        [champ]: champ === "code" ? valeur.toUpperCase().replace(/\s+/g, "") : valeur,
      };
    });
  }

  function ajouterMembreEquipe(e) {
    e.preventDefault();

    const code = nouveauMembre.code.trim().toUpperCase();
    if (!code) {
      window.alert("Code agent obligatoire, par exemple IDE-01-E ou ES-02-A.");
      return;
    }

    if (equipe.some((pro) => pro.code === code)) {
      window.alert("Ce code existe déjà dans l'équipe.");
      return;
    }

    setEquipe((actuelle) => [...actuelle, creerMembreEquipe(code, nouveauMembre.metier)]);
    setNouveauMembre({ code: "", metier: nouveauMembre.metier });
  }

  function retirerMembreEquipe(code) {
    const situationsLiees = situations.filter(
      (s) => s.referentCode === code || s.binomeCode === code || s.relaisCode === code
    );

    const message =
      situationsLiees.length > 0
        ? `Retirer ${code} de l'équipe active ? ${situationsLiees.length} fiche(s) gardent ce code en historique ou attribution.`
        : `Retirer ${code} de l'équipe active ?`;

    if (!window.confirm(message)) return;

    setEquipe((actuelle) => actuelle.filter((pro) => pro.code !== code));
  }

  function preparerModification(situation) {
    setEditingId(situation.id);
    setForm({
      ...formInitial,
      ...situation,
      codeSuffixe: suffixeDepuisCode(situation.code),
      vadParSemaine: String(situation.vadParSemaine ?? "0"),
      relaisIntensite: situation.relaisIntensite || "aucun",
      relaisCode: situation.relaisCode || "",
      relaisDebut: situation.relaisDebut || "",
      relaisFin: situation.relaisFin || "",
      historiqueCadre: situation.historiqueCadre || "",
      commentaire: situation.commentaire || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function annulerModification() {
    setEditingId(null);
    setForm(formInitial);
  }

  function enregistrerSituation(e) {
    e.preventDefault();

    if (!form.codeSuffixe || !form.referentCode) {
      alert("Code situation et référente codée sont obligatoires.");
      return;
    }

    const code = formaterCode(form.codeSuffixe);

    if (situations.some((s) => s.code === code && s.id !== editingId)) {
      alert("Ce code situation existe déjà.");
      return;
    }

    const statutCalcule =
      form.dateSignature && !["Clôturée", "Analyse réalisée — non prise en charge"].includes(form.statut)
        ? "Situation effective en cours"
        : form.delaiSuspendu
          ? "Délai suspendu"
          : form.statut;

    const situationEnregistree = {
      id: editingId || crypto.randomUUID(),
      code,
      referentCode: form.referentCode,
      binomeCode: form.binomeCode,
      metierReferent: getPro(equipe, form.referentCode)?.metier || "AUTRE",
      statut: statutCalcule,
      modalite: form.modalite,

      dateSollicitation: form.dateSollicitation,
      dateDemandeComplementESMS: form.dateDemandeComplementESMS,
      dateRetourESMS: form.dateRetourESMS,
      dateAcceptationUM: form.dateAcceptationUM,
      dateSignature: form.dateSignature,
      dateSyntheseRealisee: form.dateSyntheseRealisee,
      dateFinReelle: form.dateFinReelle,

      delaiSuspendu: form.delaiSuspendu,
      motifDelaiSuspendu: form.motifDelaiSuspendu.trim(),
      prolongation: form.prolongation,
      dateDecisionProlongation: form.dateDecisionProlongation,

      trajetKm: form.trajetKm,
      trajetMinutes: form.trajetMinutes,
      periodeTrajet: form.periodeTrajet,
      circulation: form.circulation,
      vadParSemaine: form.vadParSemaine,
      niveauMobilisation: form.niveauMobilisation,
      niveauCoordination: form.niveauCoordination,
      alerte: form.alerte,

      relaisCode: form.relaisCode,
      relaisDebut: form.relaisDebut,
      relaisFin: form.relaisFin,
      relaisIntensite: form.relaisIntensite,
      historiqueCadre: form.historiqueCadre.trim(),

      commentaire: form.commentaire.trim(),
      creeLe: situations.find((s) => s.id === editingId)?.creeLe || new Date().toISOString(),
      modifieLe: editingId ? new Date().toISOString() : "",
    };

    if (editingId) {
      setSituations((actuelles) => actuelles.map((s) => (s.id === editingId ? situationEnregistree : s)));
    } else {
      setSituations((actuelles) => [situationEnregistree, ...actuelles]);
    }

    setEditingId(null);
    setForm(formInitial);
  }

  function supprimerSituation(id) {
    const ok = window.confirm("Supprimer cette situation de l'outil cadre ?");
    if (!ok) return;
    setSituations((actuelles) => actuelles.filter((s) => s.id !== id));
  }

  function exporterJson() {
    const contenu = JSON.stringify(
      {
        outil: "Pilotage UM",
        exporteLe: new Date().toISOString(),
        situations,
        equipe,
      },
      null,
      2
    );

    telechargerFichier("pilotage-um-export.json", contenu, "application/json");
  }

  function importerJson(event) {
    const fichier = event.target.files?.[0];
    if (!fichier) return;

    const lecteur = new FileReader();

    lecteur.onload = () => {
      try {
        const donnees = JSON.parse(String(lecteur.result || "{}"));

        if (!Array.isArray(donnees.situations) || !Array.isArray(donnees.equipe)) {
          window.alert("Import impossible : le fichier JSON ne correspond pas à une sauvegarde Pilotage UM.");
          return;
        }

        const confirmation = window.confirm(
          "Importer cette sauvegarde va remplacer les situations et la disponibilité équipe actuellement enregistrées dans le navigateur. Continuer ?"
        );

        if (!confirmation) return;

        setSituations(donnees.situations);
        setEquipe(normaliserEquipe(donnees.equipe));
        setEditingId(null);
        setForm(formInitial);
        window.alert("Import JSON terminé.");
      } catch {
        window.alert("Import impossible : fichier JSON illisible.");
      } finally {
        event.target.value = "";
      }
    };

    lecteur.readAsText(fichier);
  }

  function exporterCsv() {
    const entetes = [
      "code",
      "referente_codee",
      "binome_code",
      "metier_referent",
      "statut",
      "etat_reel",
      "modalite",
      "date_sollicitation",
      "date_demande_complement_esms",
      "date_retour_esms",
      "date_acceptation_um",
      "date_signature_demarrage",
      "j45_mi_parcours",
      "j75_synthese_programmee",
      "j90_fin_theorique",
      "date_synthese_realisee",
      "date_fin_reelle",
      "delai_total_sollicitation_signature",
      "delai_suspendu_esms",
      "delai_um_hors_suspension",
      "analyse_non_prise_en_charge",
      "prolongation",
      "relais_code",
      "relais_debut",
      "relais_fin",
      "relais_intensite",
      "trajet_km_aller",
      "trajet_minutes_aller",
      "periode_trajet",
      "circulation_estimee",
      "vad_par_semaine",
      "niveau_mobilisation",
      "niveau_coordination",
      "alerte",
      "score_charge",
      "commentaire_cadre",
      "historique_cadre",
    ];

    const lignes = situations.map((s) => {
      const p = parcours(s);
      const delaiTotal = joursEntre(s.dateSollicitation, s.dateSignature);
      const delaiSuspendu = joursEntre(s.dateDemandeComplementESMS, s.dateRetourESMS);
      const delaiUM = delaiTotal === "" ? "" : Math.max(0, Number(delaiTotal) - Number(delaiSuspendu || 0));

      return [
        s.code,
        s.referentCode,
        s.binomeCode,
        s.metierReferent,
        s.statut,
        estEffective(s) ? "effective" : estPreparatoire(s) ? "preparatoire" : estAnalyseNonRetenue(s) ? "analyse_non_retenue" : "cloturee",
        s.modalite,
        s.dateSollicitation,
        s.dateDemandeComplementESMS,
        s.dateRetourESMS,
        s.dateAcceptationUM,
        s.dateSignature,
        p.miParcours,
        p.syntheseProgrammee,
        p.finTheorique,
        s.dateSyntheseRealisee,
        s.dateFinReelle,
        delaiTotal,
        delaiSuspendu,
        delaiUM,
        estAnalyseNonRetenue(s) ? "oui" : "non",
        s.prolongation ? "oui" : "non",
        s.relaisCode,
        s.relaisDebut,
        s.relaisFin,
        s.relaisIntensite,
        s.trajetKm,
        s.trajetMinutes,
        s.periodeTrajet,
        s.circulation,
        s.vadParSemaine,
        s.niveauMobilisation,
        s.niveauCoordination,
        s.alerte,
        calculerScoreSituation(s).toFixed(1),
        s.commentaire,
        s.historiqueCadre,
      ].map(csvCell).join(";");
    });

    telechargerFichier(
      "pilotage-um-export.csv",
      [entetes.join(";"), ...lignes].join("\n"),
      "text/csv;charset=utf-8"
    );
  }

  return (
    <main className="page notranslate" translate="no">
      <header className="entete enteteAvecExports">
        <div>
          <h1>Pilotage UM</h1>
          <p className="sousTitreEntete">Charge, attribution, parcours, alertes et continuité.</p>
        </div>

        <div className="actionsExport actionsExportDiscretes actionsExportEntete" aria-label="Sauvegarde et exports">
          <button type="button" className="boutonLienExport" onClick={exporterJson}>
            Export JSON
          </button>
          <button type="button" className="boutonLienExport" onClick={() => importJsonRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={importJsonRef}
            className="inputCache"
            type="file"
            accept="application/json,.json"
            onChange={importerJson}
          />
          <button type="button" className="boutonLienExport" onClick={exporterCsv}>
            Export CSV
          </button>
        </div>
      </header>

      <section className="bandeauSynthese bandeauSyntheseSix" aria-label="Synthèse cadre">
        <article className="carteSynthese">
          <span>Situations actives</span>
          <strong>{synthese.totalActif}</strong>
        </article>
        <article className="carteSynthese vert">
          <span>Charge effective</span>
          <strong>{synthese.effectives}</strong>
        </article>
        <article className="carteSynthese bleu">
          <span>Charge préparatoire</span>
          <strong>{synthese.preparatoires}</strong>
        </article>
        <article className="carteSynthese gris">
          <span>Clôtures proches</span>
          <strong>{synthese.sorties15}</strong>
        </article>
        <article className="carteSynthese orange">
          <span>Alertes parcours</span>
          <strong>{synthese.alertesParcours}</strong>
        </article>
        <article className="carteSynthese pruneDouce">
          <span>Continuité à sécuriser</span>
          <strong>{synthese.relaisASecuriser}</strong>
        </article>
      </section>

      <details className="bloc blocRepliable blocSituationsUm">
        <summary className="resumeBloc">
          <div>
            <h2>Situations UM</h2>
          </div>
          <span>{synthese.totalActif}</span>
        </summary>

        <div className="titreBloc titreBlocInterne">
          <h2>Situations UM</h2>
        </div>

        {situations.length === 0 ? (
          <div className="vide">Aucune situation saisie pour le moment.</div>
        ) : (
          <div className="listeSituations">
            {situations.map((situation) => {
              const p = parcours(situation);
              const effective = estEffective(situation);
              const cloturee = estCloturee(situation);
              const nonRetenue = estAnalyseNonRetenue(situation);
              const alerte = alerteParcours(situation);
              const score = calculerScoreSituation(situation);
              const delaiTotal = joursEntre(situation.dateSollicitation, situation.dateSignature);
              const delaiSuspendu = joursEntre(situation.dateDemandeComplementESMS, situation.dateRetourESMS);
              const delaiUM = delaiTotal === "" ? "" : Math.max(0, Number(delaiTotal) - Number(delaiSuspendu || 0));

              return (
                <details className="carteSituation carteSituationRepliee" key={situation.id}>
                  <summary className="resumeSituation">
                    <div className="resumeSituationPrincipal">
                      <strong>{situation.code}</strong>
                      <span>{situation.referentCode}{situation.binomeCode ? ` · ${situation.binomeCode}` : ""}</span>
                    </div>

                    <div className="badges">
                      {cloturee ? (
                        <span className={badgeClasse("gris")}>Clôturée</span>
                      ) : nonRetenue ? (
                        <span className={badgeClasse("gris")}>Analyse non retenue</span>
                      ) : effective ? (
                        <span className={badgeClasse("effective")}>Effective</span>
                      ) : (
                        <span className={badgeClasse("avenir")}>Préparatoire</span>
                      )}

                      {alerte && <span className={badgeClasse("alerte")}>{alerte}</span>}
                    </div>

                    <div className="resumeSituationLecture">
                      <span>{situation.modalite}</span>
                      <span>Trajet {situation.trajetKm ? `${situation.trajetKm} km` : "— km"} · {situation.trajetMinutes ? `${situation.trajetMinutes} min` : "— min"}</span>
                      <span>VAD/sem. {situation.vadParSemaine || "0"}</span>
                      <span>Score {score.toFixed(1)}</span>
                      {situation.relaisCode && <span>Relais {situation.relaisCode}</span>}
                      {situation.prolongation && <span>Prolongation</span>}
                    </div>

                    <div className="resumeSituationInfos">
                      <span>Sollic. {dateLocale(situation.dateSollicitation)}</span>
                      <span>Accept. {dateLocale(situation.dateAcceptationUM)}</span>
                      <span>Signature {dateLocale(situation.dateSignature)}</span>
                      <span>Mi-parc. {dateLocale(p.miParcours)}</span>
                      <span>Synth. {dateLocale(p.syntheseProgrammee)}</span>
                      <span>Fin théo. {dateLocale(p.finTheorique)}</span>
                      {situation.dateFinReelle && <span>Fin réelle {dateLocale(situation.dateFinReelle)}</span>}
                    </div>
                  </summary>

                  <div className="detailsSituation">
                    <div className="metaSituation">
                      <span>{lectureScore(score)}</span>
                      {situation.alerte === "rouge" && <span className={badgeClasse("retard")}>Alerte rouge</span>}
                      {situation.relaisCode && <span className={badgeClasse("alerte")}>Relais</span>}
                    </div>

                    <div className="datesCompactes datesEditables">
                      <label>
                        <span>Sollicitation</span>
                        <input
                          type="date"
                          value={situation.dateSollicitation || ""}
                          onChange={(e) => modifierSituationDirecte(situation.id, "dateSollicitation", e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Acceptation UM</span>
                        <input
                          type="date"
                          value={situation.dateAcceptationUM || ""}
                          onChange={(e) => modifierSituationDirecte(situation.id, "dateAcceptationUM", e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Signature / démarrage</span>
                        <input
                          type="date"
                          value={situation.dateSignature || ""}
                          onChange={(e) => modifierSituationDirecte(situation.id, "dateSignature", e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Synthèse réalisée</span>
                        <input
                          type="date"
                          value={situation.dateSyntheseRealisee || ""}
                          onChange={(e) => modifierSituationDirecte(situation.id, "dateSyntheseRealisee", e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Fin réelle</span>
                        <input
                          type="date"
                          value={situation.dateFinReelle || ""}
                          onChange={(e) => modifierSituationDirecte(situation.id, "dateFinReelle", e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Décision prolongation</span>
                        <input
                          type="date"
                          value={situation.dateDecisionProlongation || ""}
                          onChange={(e) => modifierSituationDirecte(situation.id, "dateDecisionProlongation", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="parcoursCompact parcoursAuto">
                      {p.demarre ? (
                        <>
                          <div>
                            <span>Signature / démarrage</span>
                            <strong>{dateLocale(situation.dateSignature)}</strong>
                          </div>
                          <div>
                            <span>J+45 mi-parcours</span>
                            <strong>{dateLocale(p.miParcours)}</strong>
                          </div>
                          <div>
                            <span>J+75 synthèse</span>
                            <strong>{dateLocale(p.syntheseProgrammee)}</strong>
                          </div>
                          <div>
                            <span>J+90 fin théorique</span>
                            <strong>{dateLocale(p.finTheorique)}</strong>
                          </div>
                        </>
                      ) : (
                        <div className="nonApplicable">
                          Parcours non démarré — J+45 / J+75 / J+90 non applicables.
                        </div>
                      )}
                    </div>

                    <div className="delaisCompact">
                      <span>Délai total sollicitation → signature : <b>{delaiTotal || "—"}</b> j</span>
                      <span>Délai suspendu ESMS : <b>{delaiSuspendu || "—"}</b> j</span>
                      <span>Délai UM hors suspension : <b>{delaiUM || "—"}</b> j</span>
                    </div>

                    {situation.relaisCode && (
                      <p className="commentaireCadre">
                        Relais {situation.relaisCode} · {situation.relaisIntensite} · du {dateLocale(situation.relaisDebut)} au {dateLocale(situation.relaisFin)}
                      </p>
                    )}

                    {situation.historiqueCadre && (
                      <p className="historiqueCadre">{situation.historiqueCadre}</p>
                    )}

                    {situation.commentaire && (
                      <p className="commentaireCadre">{situation.commentaire}</p>
                    )}

                    <div className="ligneBasSituation">
                      <span>
                        Trajet : {situation.trajetKm ? `${situation.trajetKm} km · ` : ""}{situation.trajetMinutes ? `${situation.trajetMinutes} min` : "—"}{situation.circulation && situation.circulation !== "Non renseigné" ? ` · ${situation.circulation}` : ""} · VAD/sem. : {situation.vadParSemaine || "0"}
                        {situation.prolongation ? " · Prolongation à surveiller" : ""}
                        {situation.delaiSuspendu ? " · Délai suspendu" : ""}
                      </span>

                      <div className="actionsSituation">
                        <button
                          type="button"
                          className="boutonSecondaire"
                          onClick={() => preparerModification(situation)}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="boutonDanger"
                          onClick={() => supprimerSituation(situation.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </details>
      <details className="bloc blocRepliable" key={editingId || "nouvelle-situation"} defaultOpen={Boolean(editingId)}>
        <summary className="resumeBloc">
          <div>
            <h2>{editingId ? "Modifier une fiche situation" : "Nouvelle situation"}</h2>
          </div>
          <span>{editingId ? "Déplier" : "Déplier"}</span>
        </summary>

        <div className="titreBloc titreBlocInterne">
          <h2>{editingId ? "Modifier la fiche" : "Saisie rapide"}</h2>
        </div>

        {editingId && (
          <div className="bandeauEdition">
            Modification en cours. Enregistrer mettra à jour la fiche existante.
            <button type="button" className="boutonSecondaire" onClick={annulerModification}>
              Annuler la modification
            </button>
          </div>
        )}

        <form className="formulaire" onSubmit={enregistrerSituation}>
          <section className="colonneForm">
            <h3>Situation et attribution</h3>

            <label className="champ">
              <span>Code situation</span>
              <div className="codeLigne">
                <span className="prefixeCode">UM-2026-</span>
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  placeholder="001"
                  value={form.codeSuffixe}
                  onChange={(e) => modifierForm("codeSuffixe", e.target.value)}
                />
              </div>
            </label>

            <label className="champ">
              <span>Référente codée</span>
              <select value={form.referentCode} onChange={(e) => modifierForm("referentCode", e.target.value)}>
                <option value="">Sélectionner</option>
                {equipe.map((pro) => (
                  <option key={pro.code} value={pro.code}>
                    {pro.code} — {pro.metier}
                  </option>
                ))}
              </select>
            </label>

            <label className="champ">
              <span>Binôme codé</span>
              <select value={form.binomeCode} onChange={(e) => modifierForm("binomeCode", e.target.value)}>
                <option value="">Aucun / à définir</option>
                {equipe.map((pro) => (
                  <option key={pro.code} value={pro.code}>
                    {pro.code} — {pro.metier}
                  </option>
                ))}
              </select>
            </label>

            <label className="champ">
              <span>Statut cadre</span>
              <select value={form.statut} onChange={(e) => modifierForm("statut", e.target.value)}>
                {statuts.map((statut) => (
                  <option key={statut} value={statut}>
                    {statut}
                  </option>
                ))}
              </select>
            </label>

            <div className="ligneDeux">
              <label className="champ">
                <span>Modalité</span>
                <select value={form.modalite} onChange={(e) => modifierForm("modalite", e.target.value)}>
                  {modalites.map((modalite) => (
                    <option key={modalite} value={modalite}>
                      {modalite}
                    </option>
                  ))}
                </select>
              </label>

              <label className="champ">
                <span>VAD / semaine</span>
                <select value={form.vadParSemaine} onChange={(e) => modifierForm("vadParSemaine", e.target.value)}>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </label>
            </div>

            <div className="sousBlocForm trajetCadre">
              <h3>Outil trajet</h3>

              <div className="calculateurTrajet">
                <div className="champ trajetDepartFixe">
                  <span>Départ fixe</span>
                  <strong>Centre Hospitalier Le Vinatier</strong>
                  <small>95 boulevard Pinel — 69500 Bron</small>
                </div>

                <div className="carnetStructuresTrajet">
                  <div className="enteteCarnetStructures">
                    <h4>Destination</h4>
                    <div className="actionsDestinationMini">
                      <button
                        type="button"
                        className="boutonMiniPlus"
                        title="Ajouter"
                        aria-label="Ajouter une structure"
                        onClick={() => setAfficherFormStructureTrajet((actuel) => !actuel)}
                      >
                        {afficherFormStructureTrajet ? "−" : "+"}
                      </button>
                      <button
                        type="button"
                        className="boutonMiniModifier"
                        title="Modifier"
                        aria-label="Modifier la structure sélectionnée"
                        disabled={!structureTrajetSelection}
                        onClick={() => modifierStructureTrajetExistante(structureTrajetSelection)}
                      >
                        ✎
                      </button>
                    </div>
                  </div>

                  <div className="selectionStructureTrajet">
                    <label className="champ">
                      <span>Choisir une structure</span>
                      <select
                        value={structureTrajetSelection}
                        onChange={(e) => {
                          const code = e.target.value;
                          setStructureTrajetSelection(code);
                          if (code) utiliserStructureTrajet(code);
                        }}
                      >
                        <option value="">Sélectionner</option>
                        {structuresTrajet.map((structure) => {
                          const adresse = adresseCompleteStructure(structure);
                          return (
                            <option value={structure.code} key={structure.code} disabled={!adresse}>
                              {structure.code} — {structure.nom || "Structure à nommer"}
                              {structure.ville ? ` · ${structure.ville}` : ""}
                              {!adresse ? " · adresse à compléter" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </label>


                  </div>

                  {afficherFormStructureTrajet && (
                    <div className="formStructureTrajet">
                      <input
                        type="text"
                        placeholder="Code ex : MAS-01"
                        value={structureTrajetForm.code}
                        onChange={(e) => modifierStructureTrajetForm("code", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Nom structure"
                        value={structureTrajetForm.nom}
                        onChange={(e) => modifierStructureTrajetForm("nom", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Adresse structure"
                        value={structureTrajetForm.adresse}
                        onChange={(e) => modifierStructureTrajetForm("adresse", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Code postal"
                        value={structureTrajetForm.codePostal}
                        onChange={(e) => modifierStructureTrajetForm("codePostal", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Ville"
                        value={structureTrajetForm.ville}
                        onChange={(e) => modifierStructureTrajetForm("ville", e.target.value)}
                      />
                      <div className="actionsStructureTrajet">
                        <button type="button" className="boutonPrincipal" onClick={enregistrerStructureTrajet}>
                          Enregistrer l’adresse
                        </button>
                        <button
                          type="button"
                          className="boutonSecondaire"
                          onClick={() => {
                            setStructureTrajetForm({ code: "", nom: "", adresse: "", codePostal: "", ville: "" });
                            setAfficherFormStructureTrajet(false);
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <label className="champ">
                  <span>Adresse personnelle</span>
                  <input
                    type="text"
                    placeholder="Adresse ponctuelle sans nom ni prénom"
                    value={trajetTemp.destination}
                    onChange={(e) => modifierTrajetTemp("destination", e.target.value)}
                    autoComplete="off"
                  />
                </label>

                <div className="actionsTrajetTemp">
                  <button
                    type="button"
                    className="boutonPrincipal"
                    onClick={lancerCalculTrajetTemporaire}
                    disabled={trajetTemp.chargement}
                  >
                    {trajetTemp.chargement ? "Calcul…" : "Calculer km / minutes"}
                  </button>
                  <button type="button" className="boutonSecondaire" onClick={effacerAdressesTrajetTemporaire}>
                    ×
                  </button>
                </div>

                {trajetTemp.message && <p className="messageTrajetTemp">{trajetTemp.message}</p>}
              </div>

              <div className="ligneDeux">
                <label className="champ">
                  <span>Km aller</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="ex : 28"
                    value={form.trajetKm}
                    onChange={(e) => modifierForm("trajetKm", e.target.value)}
                  />
                </label>

                <label className="champ">
                  <span>Minutes aller</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="ex : 45"
                    value={form.trajetMinutes}
                    onChange={(e) => modifierForm("trajetMinutes", e.target.value)}
                  />
                </label>
              </div>

              <div className="ligneDeux">
                <label className="champ">
                  <span>Période</span>
                  <select value={form.periodeTrajet} onChange={(e) => modifierForm("periodeTrajet", e.target.value)}>
                    {periodesTrajet.map((periode) => (
                      <option key={periode} value={periode}>
                        {periode}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="champ">
                  <span>Circulation</span>
                  <select value={form.circulation} onChange={(e) => modifierForm("circulation", e.target.value)}>
                    {circulations.map((circulation) => (
                      <option key={circulation} value={circulation}>
                        {circulation}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="ligneDeux">
              <label className="champ">
                <span>Mobilisation</span>
                <select value={form.niveauMobilisation} onChange={(e) => modifierForm("niveauMobilisation", e.target.value)}>
                  {mobilisations.map((niveau) => (
                    <option key={niveau} value={niveau}>
                      {niveau}
                    </option>
                  ))}
                </select>
              </label>

              <label className="champ">
                <span>Coordination</span>
                <select value={form.niveauCoordination} onChange={(e) => modifierForm("niveauCoordination", e.target.value)}>
                  {coordinations.map((niveau) => (
                    <option key={niveau} value={niveau}>
                      {niveau}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="champ">
              <span>Alerte cadre</span>
              <select value={form.alerte} onChange={(e) => modifierForm("alerte", e.target.value)}>
                {alertes.map((alerte) => (
                  <option key={alerte} value={alerte}>
                    {alerte}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="colonneForm">
            <h3>Dates, délais et continuité</h3>

            <label className="champ">
              <span>Date de sollicitation</span>
              <input type="date" value={form.dateSollicitation} onChange={(e) => modifierForm("dateSollicitation", e.target.value)} />
            </label>

            <label className="champ">
              <span>Demande complément ESMS</span>
              <input type="date" value={form.dateDemandeComplementESMS} onChange={(e) => modifierForm("dateDemandeComplementESMS", e.target.value)} />
            </label>

            <label className="champ">
              <span>Retour complément ESMS</span>
              <input type="date" value={form.dateRetourESMS} onChange={(e) => modifierForm("dateRetourESMS", e.target.value)} />
            </label>

            <label className="champ">
              <span>Date acceptation UM</span>
              <input type="date" value={form.dateAcceptationUM} onChange={(e) => modifierForm("dateAcceptationUM", e.target.value)} />
            </label>

            <label className="champ champImportant">
              <span>Signature / démarrage effectif</span>
              <input type="date" value={form.dateSignature} onChange={(e) => modifierForm("dateSignature", e.target.value)} />
            </label>

            <div className="rappelRegle">
              Sans signature : parcours non démarré. La synthèse est programmée d’office à J+75.
            </div>

            <div className="ligneDeux">
              <label className="champ">
                <span>Synthèse réalisée</span>
                <input type="date" value={form.dateSyntheseRealisee} onChange={(e) => modifierForm("dateSyntheseRealisee", e.target.value)} />
              </label>

              <label className="champ">
                <span>Fin réelle / clôture</span>
                <input type="date" value={form.dateFinReelle} onChange={(e) => modifierForm("dateFinReelle", e.target.value)} />
              </label>
            </div>

            <label className="caseSimple">
              <input
                type="checkbox"
                checked={form.delaiSuspendu}
                onChange={(e) => modifierForm("delaiSuspendu", e.target.checked)}
              />
              <span>Délai suspendu / attente externe</span>
            </label>

            <label className="champ">
              <span>Motif court du délai suspendu</span>
              <input
                type="text"
                maxLength="90"
                placeholder="ex : attente retour ESMS"
                value={form.motifDelaiSuspendu}
                onChange={(e) => modifierForm("motifDelaiSuspendu", e.target.value)}
              />
            </label>

            <label className="caseSimple">
              <input
                type="checkbox"
                checked={form.prolongation}
                onChange={(e) => modifierForm("prolongation", e.target.checked)}
              />
              <span>Prolongation à arbitrer / surveiller</span>
            </label>

            <label className="champ">
              <span>Date décision prolongation</span>
              <input type="date" value={form.dateDecisionProlongation} onChange={(e) => modifierForm("dateDecisionProlongation", e.target.value)} />
            </label>

            <div className="sousBlocForm">
              <h3>Relais temporaire</h3>
              <label className="champ">
                <span>Relais codé</span>
                <select value={form.relaisCode} onChange={(e) => modifierForm("relaisCode", e.target.value)}>
                  <option value="">Aucun relais</option>
                  {equipe.map((pro) => (
                    <option key={pro.code} value={pro.code}>
                      {pro.code} — {pro.metier}
                    </option>
                  ))}
                </select>
              </label>

              <div className="ligneTrois">
                <label className="champ">
                  <span>Début relais</span>
                  <input type="date" value={form.relaisDebut} onChange={(e) => modifierForm("relaisDebut", e.target.value)} />
                </label>
                <label className="champ">
                  <span>Fin relais</span>
                  <input type="date" value={form.relaisFin} onChange={(e) => modifierForm("relaisFin", e.target.value)} />
                </label>
                <label className="champ">
                  <span>Intensité</span>
                  <select value={form.relaisIntensite} onChange={(e) => modifierForm("relaisIntensite", e.target.value)}>
                    {intensitesRelais.map((niveau) => (
                      <option key={niveau} value={niveau}>
                        {niveau}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <label className="champ">
              <span>Historique cadre court</span>
              <textarea
                rows="2"
                maxLength="220"
                placeholder="ex : relais temporaire IDE-03 du 04/05 au 18/05 — absence."
                value={form.historiqueCadre}
                onChange={(e) => modifierForm("historiqueCadre", e.target.value)}
              />
            </label>

            <label className="champ">
              <span>Commentaire cadre court</span>
              <textarea
                rows="3"
                maxLength="180"
                placeholder="Non nominatif. Pas de donnée clinique identifiable."
                value={form.commentaire}
                onChange={(e) => modifierForm("commentaire", e.target.value)}
              />
            </label>
          </section>

          <div className="zoneValidation">
            <button type="submit" className="boutonPrincipal">
              {editingId ? "Enregistrer les modifications" : "Ajouter la situation"}
            </button>
          </div>
        </form>
      </details>
      <details className="bloc blocRepliable">
        <summary className="resumeBloc">
          <div>
            <h2>Charge équipe</h2>
          </div>
        </summary>

        <div className="titreBloc titreBlocInterne">
          <h2>Charge équipe</h2>
        </div>

        <div className="grilleCharge">
          {chargeProfessionnels.map((item) => {
            const scoreAjuste = Number.isFinite(item.scoreAjuste) ? item.scoreAjuste.toFixed(1) : "—";
            const resumeCharge = `${item.effectives} effectives · ${item.preparatoires} préparatoires · ${item.sorties15} sorties J+15`;
            return (
              <details className="carteCharge carteChargeCompacte" key={item.code}>
                <summary className="resumeCharge">
                  <div className="resumeChargePrincipal">
                    <strong>{item.code}</strong>
                    <span>{item.metier}</span>
                  </div>
                  <div className="resumeChargeSecondaire">
                    <span className={item.presence === "présente" ? "pastillePresence ok" : "pastillePresence vigilance"}>
                      {item.presence}
                    </span>
                    <span className="miniInfo">Score {scoreAjuste}</span>
                  </div>
                  <div className="resumeChargeLecture">{resumeCharge}</div>
                  <p className="lectureChargeResume">{item.lecture}</p>
                </summary>

                <div className="detailsCharge">
                  <div>
                    <span>Présence</span>
                    <b>{item.presence}</b>
                  </div>
                  <div>
                    <span>Charge effective</span>
                    <b>{item.effectives}</b>
                  </div>
                  <div>
                    <span>Charge préparatoire</span>
                    <b>{item.preparatoires}</b>
                  </div>
                  <div>
                    <span>Sorties sous 15 jours</span>
                    <b>{item.sorties15}</b>
                  </div>
                  <div>
                    <span>Relais portés</span>
                    <b>{item.relaisPortes}</b>
                  </div>
                  <div>
                    <span>VAD / semaine</span>
                    <b>{item.vadSemaine}</b>
                  </div>
                  <div>
                    <span>Trajets élevés</span>
                    <b>{item.trajetsEleves}</b>
                  </div>
                  <div>
                    <span>Score brut</span>
                    <b>{item.score.toFixed(1)}</b>
                  </div>
                  <div>
                    <span>Score ajusté</span>
                    <b>{scoreAjuste}</b>
                  </div>
                  <p className="lectureCharge">{item.lecture}</p>
                </div>
              </details>
            );
          })}
        </div>
      </details>
      <details className="bloc blocRepliable">
        <summary className="resumeBloc">
          <div>
            <h2>Disponibilité équipe et continuité</h2>
          </div>
        </summary>

        <div className="titreBloc titreBlocInterne">
          <h2>Disponibilité équipe et continuité</h2>
        </div>

        <div className="grilleEquipe">
          {equipe.map((pro) => {
            const dispo = statutDisponibilite(pro, dateAttributionReference);
            const absenceTexte = pro.presence === "présente"
              ? "Présence renseignée"
              : `${pro.typeAbsence || pro.presence}${pro.dateFinAbsence ? ` · vigilance ${dateLocale(pro.dateFinAbsence)}` : ""}`;
            return (
              <details className="carteEquipe" key={pro.code} defaultOpen={pro.presence !== "présente"}>
                <summary className="resumeEquipe">
                  <div className="resumeEquipePrincipal">
                    <strong>{pro.code}</strong>
                    <span>{pro.metier}</span>
                  </div>
                  <div className="resumeEquipeSecondaire">
                    <span className={pro.presence === "présente" ? "pastillePresence ok" : "pastillePresence vigilance"}>
                      {pro.presence}
                    </span>
                    <span className="miniInfo">{pro.disponibilitePct || "100"} %</span>
                  </div>
                  <div className="resumeEquipeLecture">{absenceTexte}</div>
                </summary>

                <div className="detailsEquipe">
                  <label className="champ">
                    <span>Statut de présence</span>
                    <select value={pro.presence} onChange={(e) => modifierPro(pro.code, "presence", e.target.value)}>
                      {presences.map((presence) => (
                        <option key={presence} value={presence}>
                          {presence}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="champ">
                    <span>Type d’absence</span>
                    <select value={pro.typeAbsence || ""} onChange={(e) => modifierPro(pro.code, "typeAbsence", e.target.value)}>
                      {typesAbsence.map((type) => (
                        <option key={type || "vide"} value={type}>
                          {type || "Non applicable"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="ligneTrois">
                    <label className="champ">
                      <span>Début</span>
                      <input type="date" value={pro.dateDebutAbsence || ""} onChange={(e) => modifierPro(pro.code, "dateDebutAbsence", e.target.value)} />
                    </label>
                    <label className="champ">
                      <span>Fin / vigilance</span>
                      <input type="date" value={pro.dateFinAbsence || ""} onChange={(e) => modifierPro(pro.code, "dateFinAbsence", e.target.value)} />
                    </label>
                    <label className="champ">
                      <span>Disponibilité %</span>
                      <input type="number" min="1" max="100" value={pro.disponibilitePct || "100"} onChange={(e) => modifierPro(pro.code, "disponibilitePct", e.target.value)} />
                    </label>
                  </div>

                  <label className="caseSimple">
                    <input
                      type="checkbox"
                      checked={Boolean(pro.retourConfirme)}
                      onChange={(e) => modifierPro(pro.code, "retourConfirme", e.target.checked)}
                    />
                    <span>Retour confirmé</span>
                  </label>

                  <label className="champ">
                    <span>Commentaire cadre court</span>
                    <input
                      type="text"
                      maxLength="90"
                      placeholder="Non nominatif"
                      value={pro.commentaireAbsence || ""}
                      onChange={(e) => modifierPro(pro.code, "commentaireAbsence", e.target.value)}
                    />
                  </label>

                  <p className={dispo.proposable ? "lectureDispo" : "lectureDispo bloque"}>{dispo.vigilance}</p>

                  <div className="zoneRetraitMembre">
                    <button type="button" className="boutonDanger" onClick={() => retirerMembreEquipe(pro.code)}>
                      Retirer de l’équipe active
                    </button>
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        <details className="gestionEquipeRepliee">
          <summary className="resumeGestionEquipe">
            <div>
              <strong>Ajouter / retirer un membre</strong>
              <span>{equipe.length} personne(s) dans l’équipe active. Gestion ponctuelle uniquement.</span>
            </div>
            </summary>

          <form className="ajoutMembreEquipe" onSubmit={ajouterMembreEquipe}>
            <label className="champ">
              <span>Code membre</span>
              <input
                type="text"
                maxLength="16"
                placeholder="ex : IDE-04, EDU-07, NEURO-03"
                value={nouveauMembre.code}
                onChange={(e) => modifierNouveauMembre("code", e.target.value)}
              />
            </label>

            <label className="champ">
              <span>Métier</span>
              <select value={nouveauMembre.metier} onChange={(e) => modifierNouveauMembre("metier", e.target.value)}>
                {metiers.map((metier) => (
                  <option key={metier} value={metier}>
                    {metier}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="boutonPrincipal">
              Ajouter
            </button>
          </form>

          <p className="noteCadre">
            Les membres retirés disparaissent de l’équipe active. Les anciennes fiches conservent leur code si elles étaient déjà renseignées.
          </p>
        </details>

      </details>
      <details className="bloc blocRepliable">
        <summary className="resumeBloc">
          <div>
            <h2>Aide à l’attribution</h2>
          </div>
        </summary>

        <div className="titreBloc titreBlocInterne">
          <h2>Aide à l’attribution</h2>
        </div>

        <div className="aideAttribution aideAttributionCompacte">
          <label className="champ">
            <span>Métier concerné</span>
            <select value={metierAttribution} onChange={(e) => setMetierAttribution(e.target.value)}>
              {metiers.map((metier) => (
                <option key={metier} value={metier}>
                  {metier}
                </option>
              ))}
            </select>
          </label>

          <label className="champ">
            <span>Date de signature prévue pour la nouvelle attribution</span>
            <input type="date" value={dateNouvelleAttribution} onChange={(e) => setDateNouvelleAttribution(e.target.value)} />
          </label>
        </div>

        <p className="noteCadre noteAttribution">{propositionAttribution.message}</p>

        <div className="listeAttribution">
          {propositionAttribution.classement
            .slice()
            .sort((a, b) => {
              if (a.proposable !== b.proposable) return a.proposable ? -1 : 1;
              if (a.scoreAjuste !== b.scoreAjuste) return a.scoreAjuste - b.scoreAjuste;
              return a.code.localeCompare(b.code);
            })
            .map((item) => {
              const proposee = propositionAttribution.proposee?.code === item.code;
              return (
                <details key={item.code} className={proposee ? "carteAttribution proposee" : "carteAttribution"}>
                  <summary className="resumeAttribution">
                    <div className="resumeAttributionPrincipal">
                      <strong>{item.code}</strong>
                      <span>{item.metier}</span>
                      {proposee && <span className="badgeAttribution">Proposée</span>}
                    </div>
                    <div className="resumeAttributionSecondaire">
                      <span>Score brut {item.score.toFixed(1)}</span>
                      <span>{item.proposable ? `Score ajusté ${item.scoreAjuste.toFixed(1)}` : "Non proposée"}</span>
                      <span>{item.presence}</span>
                    </div>
                  </summary>

                  <div className="detailsAttribution">
                    <div>
                      <span>Présence renseignée</span>
                      <b>{item.presence}</b>
                    </div>
                    <div>
                      <span>Disponibilité</span>
                      <b>{item.disponibilitePct || "100"} %</b>
                    </div>
                    <div>
                      <span>Lecture</span>
                      <b>{item.lecture}</b>
                    </div>
                    <p className={proposee ? "noteAttributionInterne proposee" : "noteAttributionInterne"}>
                      {item.disponibiliteLecture}
                      {proposee ? " · Professionnelle actuellement proposée pour rééquilibrage." : ""}
                    </p>
                  </div>
                </details>
              );
            })}
        </div>
      </details>
      <details className="bloc blocRepliable blocBilanArs">
        <summary className="resumeBloc">
          <div>
            <h2>Bilan activité / lecture ARS</h2>
          </div>
        </summary>

        <div className="titreBloc titreBlocInterne">
          <h2>Bilan activité / lecture ARS</h2>
        </div>

        <div className="grilleBilanArs">
          <div className="tuileBilan"><span>Total</span><strong>{indicateursBilan.total}</strong></div>
          <div className="tuileBilan"><span>Effectives</span><strong>{indicateursBilan.effectives}</strong></div>
          <div className="tuileBilan"><span>Préparatoires</span><strong>{indicateursBilan.preparatoires}</strong></div>
          <div className="tuileBilan"><span>Clôturées</span><strong>{indicateursBilan.cloturees}</strong></div>
          <div className="tuileBilan"><span>Analyses non retenues</span><strong>{indicateursBilan.nonRetenues}</strong></div>
          <div className="tuileBilan"><span>Prolongations</span><strong>{indicateursBilan.prolongations}</strong></div>
          <div className="tuileBilan"><span>Délai moyen sollicitation → signature</span><strong>{indicateursBilan.delaiTotalMoyen} j</strong></div>
          <div className="tuileBilan"><span>Délai moyen UM hors suspension</span><strong>{indicateursBilan.delaiUMMoyen} j</strong></div>
          <div className="tuileBilan"><span>Durée moyenne de parcours</span><strong>{indicateursBilan.dureeMoyenne} j</strong></div>
          <div className="tuileBilan"><span>VAD hebdo cumulées</span><strong>{indicateursBilan.vadTotal}</strong></div>
          <div className="tuileBilan"><span>Km aller moyens</span><strong>{indicateursBilan.kmMoyens}</strong></div>
          <div className="tuileBilan"><span>Minutes aller moyennes</span><strong>{indicateursBilan.minutesMoyennes}</strong></div>
        </div>

        <div className="grilleModalitesArs">
          <div className="miniCarteModalite"><span>VAD</span><strong>{indicateursBilan.modaliteVad}</strong></div>
          <div className="miniCarteModalite"><span>Structure</span><strong>{indicateursBilan.modaliteStructure}</strong></div>
          <div className="miniCarteModalite"><span>Mixte</span><strong>{indicateursBilan.modaliteMixte}</strong></div>
        </div>
      </details>




      {situationsASeecuriser.length > 0 && (
        <section className="bloc blocAlerte">
          <div className="titreBloc">
            <h2>Continuité à sécuriser</h2>
            <p>Situations portées par une professionnelle absente ou non mobilisable sans relais renseigné.</p>
          </div>

          <div className="listeRelais">
            {situationsASeecuriser.map((s) => {
              const p = parcours(s);
              return (
                <article className="carteRelais" key={s.id}>
                  <strong>{s.code}</strong>
                  <span>Référente {s.referentCode} · Binôme {s.binomeCode || "—"}</span>
                  <span>Signature {dateLocale(s.dateSignature)} · Mi-parcours {dateLocale(p.miParcours)} · Synthèse {dateLocale(p.syntheseProgrammee)}</span>
                  <button type="button" className="boutonSecondaire" onClick={() => preparerModification(s)}>
                    Organiser le relais
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}



    </main>
  );
}
