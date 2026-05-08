# Repères UM 2.0 — Spécification V1 mise à jour

Repères UM 2.0 est un outil personnel cadre pour l’Unité Mobile.

Il n’est pas un DPI, pas un dossier patient, pas un outil de soin et pas un outil de surveillance.

## Principes métier

> Prévu n’est pas programmé.  
> Programmé n’est pas effectif.  
> Préparé n’est pas pleinement engagé.

L’outil distingue toujours :

- charge effective actuelle ;
- charge préparatoire ;
- charge projetée ;
- situations analysées non retenues ;
- délais internes UM ;
- délais suspendus liés à une attente externe.

## Signature et parcours

La date de signature vaut date de démarrage effectif.

À partir de la date de signature, l’outil calcule automatiquement :

- J+45 : mi-parcours ;
- J+75 : synthèse programmée d’office ;
- J+90 : fin théorique.

Sans signature, le parcours est considéré comme non démarré.

## Statuts V1

- Demande reçue
- En attente éléments ESMS
- Délai suspendu
- Analyse en cours
- Analyse réalisée — non prise en charge
- Acceptée — signature à programmer
- Signature programmée
- Situation effective en cours
- Mi-parcours à surveiller
- Synthèse à préparer
- Prolongation à arbitrer
- En clôture
- Clôturée

## Charge

La charge n’est pas seulement le nombre de situations.

Elle tient compte :

- du statut de la situation ;
- de la charge préparatoire ;
- de la charge effective ;
- des sorties prévues sous 7, 15 et 30 jours ;
- du trajet estimé ;
- du nombre de VAD par semaine ;
- du niveau de mobilisation ;
- du niveau de coordination ;
- des prolongations ;
- des alertes.

Une situation proche de la sortie compte encore dans la charge actuelle, mais elle allège la charge projetée.

## Aide à l’attribution

L’outil peut proposer une professionnelle pour rééquilibrage, par métier :

- IDE avec IDE ;
- éducatrice avec éducatrice ;
- neuropsychologue avec neuropsychologue.

La proposition ne vaut pas décision automatique.

La validation appartient à Michèle.

Formulation autorisée :

> Professionnelle proposée pour rééquilibrage. Validation cadre nécessaire.

Formulations interdites :

- disponible ;
- sous-chargée ;
- doit prendre ;
- pas assez de situations.

## Données autorisées

- code situation ;
- référente codée ;
- binôme codé ;
- métier ;
- statut ;
- dates clés ;
- délai suspendu ;
- modalité ;
- trajet estimé ;
- VAD par semaine ;
- niveau de mobilisation ;
- niveau de coordination ;
- alerte ;
- prolongation ;
- commentaire cadre court non identifiant.

## Données interdites

- nom ;
- prénom ;
- date de naissance ;
- adresse ;
- numéro DPI ;
- diagnostic nominatif ;
- données médicales ou cliniques identifiantes ;
- détails familiaux identifiants.


## Ajout validé — Absences / roulement / modification des fiches

Repères UM 2.0 intègre un module de disponibilité professionnelle pour soutenir la continuité d’équipe.

Règles :

- Une fiche situation peut être modifiée après création.
- Une réattribution peut être temporaire ou définitive.
- Un relais temporaire est visible sans effacer la référente initiale.
- Une professionnelle en arrêt maladie non confirmé n’est pas proposée pour une nouvelle attribution.
- Une absence planifiée peut être prise en compte si la date de retour est exploitable.
- Une disponibilité réduite ajuste le score d’attribution.
- Les situations portées par une professionnelle absente apparaissent en continuité à sécuriser.
- La date de fin d’arrêt maladie, lorsqu’elle existe, est un point de vigilance, pas une capacité projetée.

Phrase métier :

> L’arrêt maladie déclenche une logique de continuité, pas une logique d’attribution.


## Évolution — Objectifs signature

Ajout d’un module replié par défaut permettant de sélectionner des objectifs types et de générer un texte court prêt à copier pour la réunion de signature. L’outil aide à formuler, il ne décide pas.
