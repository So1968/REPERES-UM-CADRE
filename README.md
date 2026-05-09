# Pilotage UM — cadre

Outil personnel cadre pour l’Unité Mobile.

## Positionnement

Pilotage UM n’est pas un DPI, pas un dossier patient, pas un outil de soin et pas un outil de surveillance.

C’est un tableau personnel cadre, non nominatif, d’organisation, d’alertes, de charge, de continuité, d’harmonisation des pratiques et d’aide à l’attribution.

## Phrases clés

> Prévu n’est pas programmé.  
> Programmé n’est pas effectif.  
> Préparé n’est pas pleinement engagé.

> On ne simplifie pas le raisonnement clinique ; on simplifie son accès.

## Règles non négociables

- Aucune donnée réelle dans Git.
- Aucune donnée nominative.
- Aucune donnée de santé identifiable.
- Les situations sont codées : `UM-2026-001`, `UM-2026-002`, etc.
- La date de signature vaut date de démarrage effectif.
- Sans signature, le parcours n’est pas démarré.
- J+45 = mi-parcours.
- J+75 = synthèse programmée d’office.
- J+90 = fin théorique.
- Charge effective actuelle ≠ charge préparatoire ≠ charge projetée.
- L’aide à l’attribution ne remplace pas la décision de Michèle.

## Données autorisées

- code situation ;
- statut ;
- référente codée ;
- binôme codé ;
- métier ;
- dates clés ;
- date de sollicitation ;
- date de demande complément ESMS ;
- date de retour ESMS ;
- date d’acceptation UM ;
- date de signature / démarrage ;
- synthèse programmée automatiquement ;
- fin théorique ;
- fin réelle ;
- délai suspendu ;
- modalité : VAD / structure / mixte ;
- trajet estimé ;
- VAD par semaine ;
- niveau de mobilisation ;
- niveau de coordination ;
- alerte ;
- prolongation ;
- commentaire cadre court.

## Données interdites

- nom ;
- prénom ;
- date de naissance ;
- adresse ;
- diagnostic nominatif ;
- éléments médicaux ou cliniques identifiants ;
- détails familiaux ;
- numéro DPI identifiant.

## Modules V1 actualisés

1. Tableau de bord cadre
2. Situations codées
3. Saisie rapide
4. Charge équipe actuelle / préparatoire / projetée
5. Aide à l’attribution par métier
6. Délais et délai suspendu
7. Analyse réalisée — non prise en charge
8. Dates automatiques J+45 / J+75 / J+90
9. Prolongations
10. Sauvegarde / export JSON
11. Export CSV bilan

## Sauvegarde

- Sauvegarde locale navigateur.
- Export JSON = sauvegarde complète.
- Export CSV = bilan / extraction.
- Ne jamais mettre les sauvegardes réelles dans Git.

Stockage conseillé : `Documents / Pilotage UM` + copie clé USB-C ou disque externe.


## Module ajouté — Absences / roulement

L’outil permet maintenant de modifier une fiche situation, de renseigner la disponibilité des professionnelles, d’exclure les arrêts maladie non confirmés de l’aide à l’attribution, et de repérer les situations à relayer.

Règle métier : un arrêt maladie ne se projette pas comme une disponibilité future.


## Confort visuel et usage mobile

La version actuelle utilise une palette adoucie écru / sauge / prune, moins lumineuse que le blanc et le bleu initiaux. Les blocs charge équipe et absences sont compacts et repliables pour faciliter l'usage sur PC, téléphone et Samsung Galaxy Z Fold.


## Mise à jour — affichage replié, trajets et confort visuel

- La saisie d'une nouvelle situation est repliée par défaut.
- La charge équipe affiche d'abord un résumé, puis les détails à la demande.
- Le module trajet ne stocke pas d'adresse : uniquement km et minutes estimées depuis l'hôpital.
- La palette visuelle a été adoucie : sable, sauge, ardoise, ocre doux.


## Sauvegarde / restauration

L’outil permet maintenant l’export JSON, l’import JSON et l’export CSV. Les exports réels ne doivent pas être déposés dans Git.


## Évolution — Objectifs signature

Ajout d’un module replié par défaut permettant de sélectionner des objectifs types et de générer un texte court prêt à copier pour la réunion de signature. L’outil aide à formuler, il ne décide pas.
