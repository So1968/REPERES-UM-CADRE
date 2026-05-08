# Sauvegarde et restauration — Repères UM 2.0

## Principe

Repères UM 2.0 utilise une sauvegarde locale dans le navigateur.

Pour sécuriser le travail cadre, l’outil permet maintenant :

- export JSON ;
- import JSON ;
- export CSV.

## Export JSON

L’export JSON sert de sauvegarde complète de travail.

Il contient :

- les situations codées ;
- la disponibilité équipe ;
- les relais renseignés ;
- les données de charge ;
- les champs cadre non nominatifs.

Il ne doit pas contenir de nom, prénom, adresse, diagnostic, numéro DPI ou donnée clinique identifiable.

## Import JSON

L’import JSON remplace les données actuellement enregistrées dans le navigateur par celles de la sauvegarde importée.

Une confirmation est demandée avant remplacement.

## Export CSV

L’export CSV sert au bilan, au suivi d’activité et à la préparation des extractions ARS.

## Règle cadre

Le JSON exporté est une sauvegarde de travail.
Il ne doit pas être déposé dans Git s’il contient des données réelles.
