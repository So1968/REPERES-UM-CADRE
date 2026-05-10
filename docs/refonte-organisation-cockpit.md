# Refonte organisation — Cockpit Pilotage UM

## Objectif

Fusionner l’interface sans modifier les calculs métier.

La situation reste la colonne vertébrale de l’outil.

## Règle de sécurité

Ne pas modifier :
- calcul de charge effective ;
- calcul de charge prévisionnelle ;
- score situation ;
- score agent ;
- disponibilité / proposable ;
- parcours J+45 / J+75 / J+90 ;
- retard ESMS ;
- temps réponse UM ;
- export JSON ;
- export CSV.

## Organisation cible

### 1. Vue d’ensemble

Toujours visible :
- situations actives ;
- charge effective ;
- charge préparatoire ;
- alertes parcours ;
- retards ESMS ;
- temps réponse UM ;
- continuité à sécuriser.

### 2. Situations

Bloc central.

Chaque carte situation doit afficher :
- code situation ;
- référente / binôme ;
- statut ;
- effective ou préparatoire ;
- démarrage ;
- J+45 ;
- J+75 ;
- J+90 ;
- retard ESMS ;
- temps réponse UM ;
- score charge ;
- alerte ;
- relais si besoin.

### 3. Équipe & attribution

Fusion de :
- charge équipe ;
- disponibilité équipe et continuité ;
- aide à l’attribution.

Lecture attendue :
- une vue équipe par professionnelle ;
- un tableau comparatif pour départager une attribution ;
- score ajusté visible ;
- charge effective visible ;
- charge prévisionnelle visible ;
- présence / absence visible ;
- relais et continuité visibles.

### 4. Saisie / modification

La saisie reste accessible mais ne doit pas envahir l’écran.

Elle contient :
- situation et attribution ;
- trajet ;
- mobilisation / coordination / alerte ;
- dates, délais et continuité ;
- relais temporaire ;
- commentaire cadre.

### 5. Bilan

Lecture globale :
- total ;
- effectives ;
- préparatoires ;
- clôturées ;
- prolongations ;
- retards ESMS ;
- temps réponse UM ;
- durée moyenne parcours ;
- VAD ;
- kilomètres / minutes.

## Principe ergonomique

Ne pas multiplier les blocs.
Ne pas tout ouvrir en même temps.
Afficher d’abord ce qui aide à décider.

## Phrase repère

Prévu n’est pas commencé. Programmé n’est pas effectif.
