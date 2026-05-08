# Application Repères UM 2.0

Application React/Vite locale pour l’outil cadre Repères UM 2.0.

## Lancer l’app

```bash
npm install
npm run dev
```

## Construire l’app

```bash
npm run build
```

## Évolutions intégrées

- signature = démarrage effectif ;
- calcul automatique J+45 / J+75 / J+90 ;
- délai suspendu ;
- statut Analyse réalisée — non prise en charge ;
- charge effective / préparatoire / projetée ;
- score interne de vigilance charge ;
- aide à l’attribution par métier ;
- export JSON ;
- export CSV.


## Continuité d’équipe

La version intègre la modification des fiches, les disponibilités professionnelles, les absences, les relais temporaires et l’impact sur l’aide à l’attribution.


## Affichage responsive

Le module absences / roulement utilise des cartes repliables : vue PC en grille compacte, vue téléphone en colonne avec résumé court et détails à ouvrir.


## Mise à jour — affichage replié, trajets et confort visuel

- La saisie d'une nouvelle situation est repliée par défaut.
- La charge équipe affiche d'abord un résumé, puis les détails à la demande.
- Le module trajet ne stocke pas d'adresse : uniquement km et minutes estimées depuis l'hôpital.
- La palette visuelle a été adoucie : sable, sauge, ardoise, ocre doux.


## Sauvegarde / restauration

Boutons disponibles dans l’en-tête : Export JSON, Import JSON et Export CSV.

L’import JSON remplace les données locales après confirmation.


## Évolution — Objectifs signature

Ajout d’un module replié par défaut permettant de sélectionner des objectifs types et de générer un texte court prêt à copier pour la réunion de signature. L’outil aide à formuler, il ne décide pas.


## Gestion équipe active

Le module Disponibilité / absences / roulement permet d’ajouter ou retirer des membres codés de l’équipe active sans saisir de noms.
