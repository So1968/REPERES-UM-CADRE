import { useEffect, useMemo, useState } from "react";
import "./index.css";

const STORAGE_KEY = "reperes-um-2-cadre-v2";

const agents = [
  "Agent A",
  "Agent B",
  "Agent C",
  "Agent D",
  "Agent E",
  "Agent F",
  "Agent G",
  "Agent H",
];

const statuts = [
  "Demande transmise",
  "Dossier en attente",
  "Dossier reçu",
  "Signature à programmer",
  "Signature programmée",
  "Situation à venir",
  "Situation effective en cours",
  "Mi-parcours à surveiller",
  "Synthèse à programmer",
  "Prolongation à arbitrer",
  "Clôturée",
];

const modalites = ["Structure", "VAD", "Mixte", "Non défini"];

const formInitial = {
  codeSuffixe: "",
  agent: "",
  binome: "",
  statut: "Situation à venir",
  modalite: "Non défini",
  trajet: "",
  professionnels: "1",
  reception: "",
  signaturePrevue: "",
  signatureProgrammee: "",
  debutEffectif: "",
  prolongation: false,
  commentaire: "",
};

function dateLocale(date) {
  if (!date) return "—";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
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

function formaterCode(numero) {
  const propre = String(numero || "").replace(/\D/g, "");
  if (!propre) return "";
  return `UM-2026-${propre.padStart(3, "0")}`;
}

function estEffective(situation) {
  return Boolean(situation.debutEffectif);
}

function estCloturee(situation) {
  return situation.statut === "Clôturée";
}

function estAVenir(situation) {
  return !estEffective(situation) && !estCloturee(situation);
}

function parcours(situation) {
  if (!estEffective(situation)) {
    return {
      demarre: false,
      miParcours: "",
      synthese: "",
      fin: "",
    };
  }

  return {
    demarre: true,
    miParcours: ajouterJours(situation.debutEffectif, 45),
    synthese: ajouterJours(situation.debutEffectif, 75),
    fin: ajouterJours(situation.debutEffectif, 90),
  };
}

function alerteJ4(situation) {
  if (!estAVenir(situation)) return false;

  const dates = [situation.signaturePrevue, situation.signatureProgrammee].filter(Boolean);

  return dates.some((date) => {
    const j = joursAvant(date);
    return j !== null && j >= 0 && j <= 4;
  });
}

function alerteParcours(situation) {
  if (!estEffective(situation) || estCloturee(situation)) return null;

  const p = parcours(situation);
  const jMi = joursAvant(p.miParcours);
  const jSynthese = joursAvant(p.synthese);
  const jFin = joursAvant(p.fin);

  if (jFin !== null && jFin < 0) return "Fin théorique dépassée";
  if (jFin !== null && jFin <= 7) return "Fin théorique proche";
  if (jSynthese !== null && jSynthese <= 7) return "Synthèse à préparer";
  if (jMi !== null && jMi <= 7) return "Mi-parcours à surveiller";

  return null;
}

function niveauMobilisation(situation) {
  let score = 0;

  if (estEffective(situation)) score += 2;
  if (situation.modalite === "Mixte") score += 2;
  if (situation.modalite === "VAD") score += 1;
  if (Number(situation.trajet) >= 45) score += 1;
  if (Number(situation.trajet) >= 75) score += 1;
  if (Number(situation.professionnels) >= 2) score += 1;
  if (alerteJ4(situation)) score += 1;
  if (alerteParcours(situation)) score += 1;
  if (situation.prolongation) score += 2;

  if (score >= 6) return "Point cadre à discuter";
  if (score >= 4) return "Vigilance renforcée";
  if (score >= 2) return "Vigilance simple";
  return "Mobilisation simple";
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

export default function App() {
  const [situations, setSituations] = useState(() => {
    try {
      const sauvegarde = localStorage.getItem(STORAGE_KEY);
      return sauvegarde ? JSON.parse(sauvegarde) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(formInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(situations));
  }, [situations]);

  const synthese = useMemo(() => {
    const effectives = situations.filter((s) => estEffective(s) && !estCloturee(s));
    const avenir = situations.filter(estAVenir);
    const cloturees = situations.filter(estCloturee);
    const alertesJ4 = situations.filter(alerteJ4);
    const alertesParcours = situations.filter(alerteParcours);

    return {
      total: situations.length,
      effectives: effectives.length,
      avenir: avenir.length,
      cloturees: cloturees.length,
      alertesJ4: alertesJ4.length,
      alertesParcours: alertesParcours.length,
    };
  }, [situations]);

  const chargeAgents = useMemo(() => {
    return agents.map((agent) => {
      const liste = situations.filter(
        (s) => !estCloturee(s) && (s.agent === agent || s.binome === agent)
      );

      const commeReferent = liste.filter((s) => s.agent === agent).length;
      const commeBinome = liste.filter((s) => s.binome === agent).length;

      return {
        agent,
        effective: liste.filter(estEffective).length,
        previsionnelle: liste.filter(estAVenir).length,
        alertes: liste.filter((s) => alerteJ4(s) || alerteParcours(s)).length,
        commeReferent,
        commeBinome,
      };
    });
  }, [situations]);

  function modifierForm(champ, valeur) {
    setForm((actuel) => ({
      ...actuel,
      [champ]: valeur,
    }));
  }

  function ajouterSituation(e) {
    e.preventDefault();

    if (!form.codeSuffixe || !form.agent) {
      alert("Code situation et agent sont obligatoires.");
      return;
    }

    const code = formaterCode(form.codeSuffixe);

    if (situations.some((s) => s.code === code)) {
      alert("Ce code situation existe déjà.");
      return;
    }

    const nouvelleSituation = {
      id: crypto.randomUUID(),
      code,
      agent: form.agent,
      binome: form.binome,
      statut: form.debutEffectif ? "Situation effective en cours" : form.statut,
      modalite: form.modalite,
      trajet: form.trajet,
      professionnels: form.professionnels,
      reception: form.reception,
      signaturePrevue: form.signaturePrevue,
      signatureProgrammee: form.signatureProgrammee,
      debutEffectif: form.debutEffectif,
      prolongation: form.prolongation,
      commentaire: form.commentaire.trim(),
      creeLe: new Date().toISOString(),
    };

    setSituations((actuelles) => [nouvelleSituation, ...actuelles]);
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
        outil: "Repères UM 2.0 cadre",
        exporteLe: new Date().toISOString(),
        situations,
      },
      null,
      2
    );

    telechargerFichier("reperes-um-2-cadre-export.json", contenu, "application/json");
  }

  function exporterCsv() {
    const entetes = [
      "code",
      "agent",
      "binome",
      "statut",
      "etat_reel",
      "modalite",
      "trajet_estime",
      "professionnels",
      "reception_idec",
      "signature_prevue",
      "signature_programmee",
      "demarrage_effectif",
      "j45_mi_parcours",
      "j75_synthese",
      "j90_fin_theorique",
      "alerte_j4",
      "alerte_parcours",
      "mobilisation",
      "prolongation",
      "commentaire_cadre",
    ];

    const lignes = situations.map((s) => {
      const p = parcours(s);
      return [
        s.code,
        s.agent,
        s.binome,
        s.statut,
        estEffective(s) ? "effective" : "a_venir",
        s.modalite,
        s.trajet,
        s.professionnels,
        s.reception,
        s.signaturePrevue,
        s.signatureProgrammee,
        s.debutEffectif,
        p.miParcours,
        p.synthese,
        p.fin,
        alerteJ4(s) ? "oui" : "non",
        alerteParcours(s) || "",
        niveauMobilisation(s),
        s.prolongation ? "oui" : "non",
        s.commentaire,
      ].map(csvCell).join(";");
    });

    telechargerFichier(
      "reperes-um-2-cadre-export.csv",
      [entetes.join(";"), ...lignes].join("\n"),
      "text/csv;charset=utf-8"
    );
  }

  return (
    <main className="page notranslate" translate="no">
      <header className="entete">
        <div>
          <p className="surTitre">Repères UM 2.0</p>
          <h1>Tableau de bord cadre</h1>
          <p className="phraseCle">
            Prévu n’est pas commencé. Programmé n’est pas effectif.
          </p>
        </div>

        <div className="actionsExport">
          <button type="button" className="boutonSecondaire" onClick={exporterJson}>
            Export JSON
          </button>
          <button type="button" className="boutonSecondaire" onClick={exporterCsv}>
            Export CSV
          </button>
        </div>
      </header>

      <section className="bandeauSynthese" aria-label="Synthèse cadre">
        <article className="carteSynthese">
          <span>Total</span>
          <strong>{synthese.total}</strong>
        </article>
        <article className="carteSynthese vert">
          <span>Charge effective</span>
          <strong>{synthese.effectives}</strong>
        </article>
        <article className="carteSynthese bleu">
          <span>Charge prévisionnelle</span>
          <strong>{synthese.avenir}</strong>
        </article>
        <article className="carteSynthese orange">
          <span>Alertes J-4</span>
          <strong>{synthese.alertesJ4}</strong>
        </article>
        <article className="carteSynthese rouge">
          <span>Échéances parcours</span>
          <strong>{synthese.alertesParcours}</strong>
        </article>
      </section>

      <section className="bloc">
        <div className="titreBloc">
          <h2>Saisie rapide</h2>
          <p>Deux colonnes : situation à gauche, dates du parcours à droite.</p>
        </div>

        <form className="formulaire" onSubmit={ajouterSituation}>
          <section className="colonneForm">
            <h3>Situation</h3>

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
              <span>Agent référent</span>
              <select value={form.agent} onChange={(e) => modifierForm("agent", e.target.value)}>
                <option value="">Sélectionner</option>
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </label>

            <label className="champ">
              <span>Binôme</span>
              <select value={form.binome} onChange={(e) => modifierForm("binome", e.target.value)}>
                <option value="">Aucun / à définir</option>
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
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
                <span>Pros mobilisés</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={form.professionnels}
                  onChange={(e) => modifierForm("professionnels", e.target.value)}
                />
              </label>
            </div>

            <label className="champ">
              <span>Trajet estimé en minutes</span>
              <input
                type="number"
                min="0"
                placeholder="ex : 45"
                value={form.trajet}
                onChange={(e) => modifierForm("trajet", e.target.value)}
              />
            </label>
          </section>

          <section className="colonneForm">
            <h3>Dates du parcours</h3>

            <label className="champ">
              <span>Réception courrier IDEC</span>
              <input
                type="date"
                value={form.reception}
                onChange={(e) => modifierForm("reception", e.target.value)}
              />
            </label>

            <label className="champ">
              <span>Signature prévue</span>
              <input
                type="date"
                value={form.signaturePrevue}
                onChange={(e) => modifierForm("signaturePrevue", e.target.value)}
              />
            </label>

            <label className="champ">
              <span>Signature programmée</span>
              <input
                type="date"
                value={form.signatureProgrammee}
                onChange={(e) => modifierForm("signatureProgrammee", e.target.value)}
              />
            </label>

            <label className="champ champImportant">
              <span>Démarrage effectif</span>
              <input
                type="date"
                value={form.debutEffectif}
                onChange={(e) => modifierForm("debutEffectif", e.target.value)}
              />
            </label>

            <div className="rappelRegle">
              Sans démarrage effectif : parcours non démarré, charge non effective.
            </div>

            <label className="caseSimple">
              <input
                type="checkbox"
                checked={form.prolongation}
                onChange={(e) => modifierForm("prolongation", e.target.checked)}
              />
              <span>Prolongation à surveiller</span>
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
              Ajouter la situation
            </button>
          </div>
        </form>
      </section>

      <section className="bloc">
        <div className="titreBloc">
          <h2>Charge équipe</h2>
          <p>L’outil signale des vigilances. Il ne déclare pas seul une surcharge.</p>
        </div>

        <div className="grilleCharge">
          {chargeAgents.map((item) => (
            <article className="carteCharge" key={item.agent}>
              <strong>{item.agent}</strong>
              <div>
                <span>Effective</span>
                <b>{item.effective}</b>
              </div>
              <div>
                <span>Prévisionnelle</span>
                <b>{item.previsionnelle}</b>
              </div>
              <div>
                <span>Alertes</span>
                <b>{item.alertes}</b>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bloc">
        <div className="titreBloc">
          <h2>Situations codées</h2>
          <p>Lecture compacte : état réel, échéances, alertes et mobilisation.</p>
        </div>

        {situations.length === 0 ? (
          <div className="vide">Aucune situation saisie pour le moment.</div>
        ) : (
          <div className="listeSituations">
            {situations.map((situation) => {
              const p = parcours(situation);
              const effective = estEffective(situation);
              const cloturee = estCloturee(situation);
              const j4 = alerteJ4(situation);
              const alerte = alerteParcours(situation);
              const mobilisation = niveauMobilisation(situation);

              return (
                <article className="carteSituation" key={situation.id}>
                  <div className="ligneSituationPrincipale">
                    <div>
                      <strong>{situation.code}</strong>
                      <p>
                        {situation.agent}
                        {situation.binome ? ` · Binôme ${situation.binome}` : ""}
                      </p>
                    </div>

                    <div className="badges">
                      {cloturee ? (
                        <span className={badgeClasse("gris")}>Clôturée</span>
                      ) : effective ? (
                        <span className={badgeClasse("effective")}>Effective</span>
                      ) : (
                        <span className={badgeClasse("avenir")}>À venir</span>
                      )}

                      {j4 && <span className={badgeClasse("alerte")}>J-4</span>}
                      {alerte && <span className={badgeClasse("retard")}>{alerte}</span>}
                    </div>
                  </div>

                  <div className="metaSituation">
                    <span>{situation.statut}</span>
                    <span>{situation.modalite}</span>
                    <span>{mobilisation}</span>
                  </div>

                  <div className="datesCompactes">
                    <div>
                      <span>Réception</span>
                      <strong>{dateLocale(situation.reception)}</strong>
                    </div>
                    <div>
                      <span>Signature prévue</span>
                      <strong>{dateLocale(situation.signaturePrevue)}</strong>
                    </div>
                    <div>
                      <span>Signature programmée</span>
                      <strong>{dateLocale(situation.signatureProgrammee)}</strong>
                    </div>
                    <div>
                      <span>Démarrage effectif</span>
                      <strong>{dateLocale(situation.debutEffectif)}</strong>
                    </div>
                  </div>

                  <div className="parcoursCompact">
                    {p.demarre ? (
                      <>
                        <div>
                          <span>J+45</span>
                          <strong>{dateLocale(p.miParcours)}</strong>
                        </div>
                        <div>
                          <span>J+75</span>
                          <strong>{dateLocale(p.synthese)}</strong>
                        </div>
                        <div>
                          <span>J+90</span>
                          <strong>{dateLocale(p.fin)}</strong>
                        </div>
                      </>
                    ) : (
                      <div className="nonApplicable">
                        Parcours non démarré — J+45 / J+75 / J+90 non applicables.
                      </div>
                    )}
                  </div>

                  {situation.commentaire && (
                    <p className="commentaireCadre">{situation.commentaire}</p>
                  )}

                  <div className="ligneBasSituation">
                    <span>
                      Trajet : {situation.trajet ? `${situation.trajet} min` : "—"} · Pros :{" "}
                      {situation.professionnels || "—"}
                      {situation.prolongation ? " · Prolongation à surveiller" : ""}
                    </span>

                    <button
                      type="button"
                      className="boutonDanger"
                      onClick={() => supprimerSituation(situation.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
