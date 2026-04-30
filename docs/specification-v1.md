# Repères UM 2.0 — Spécification V1

Repères UM 2.0 est un outil personnel cadre pour l’Unité Mobile.

## Principe central

> Prévu n’est pas commencé. Programmé n’est pas effectif.

## Carte situation

```json
{
  "code": "UM-2026-001",
  "etat": "a_venir",
  "etape": "signature_programmee",
  "dates": {
    "signature": "",
    "demarrage_effectif": "",
    "mi_parcours": "",
    "synthese": "",
    "fin_theorique": "",
    "cloture": ""
  },
  "alerte": "aucune",
  "prochaine_action": "faire_signature",
  "note": ""
}

Puis :

```bash
cat > docs/regles-confidentialite.md <<'EOF'
# Repères UM 2.0 — Règles de confidentialité

## Principe

Repères UM 2.0 est un outil non nominatif.

Aucune donnée permettant d’identifier une personne ne doit être saisie, stockée ou exportée.

## Données interdites

- nom
- prénom
- date de naissance
- adresse
- numéro DPI
- diagnostic nominatif
- données médicales identifiantes
- détails familiaux identifiants

## Données autorisées

- code situation
- statut
- étape
- dates clés
- modalité
- alerte
- commentaire cadre court non identifiant

## Sauvegarde

- sauvegarde locale
- export JSON
- export CSV

Aucune donnée réelle ne doit être déposée dans GitHub.
