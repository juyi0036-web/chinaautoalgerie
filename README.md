# China Auto Algérie

> **Votre voiture chinoise en Algérie** — Le portail professionnel des voitures chinoises vers l'Algérie.

[![Netlify Status](https://img.shields.io/badge/live-CloudStudio-brightgreen)](https://a0a3a8dbae5240f48d482a37c5df31a0.app.codebuddy.work)
[![Language](https://img.shields.io/badge/lang-français-blue)]()

## À propos

China Auto Algérie est une plateforme de vente automobile contrôlée par une équipe chinoise, dédiée à l'importation de véhicules chinois de qualité vers le marché algérien. Notre modèle combine les avantages de la chaîne d'approvisionnement chinoise avec un service local en Algérie.

## Structure du site

```
├── index.html          # Site vitrine (single-page)
├── logo/               # Logos (icône + wordmark)
├── images/             # Photos supply chain & équipe locale
├── videos/             # Vidéo logistique maritime
├── docs/               # Kit de marque et documentation
│   ├── brand-kit.md    # Guide complet réseaux sociaux
│   ├── brand-kit.html  # Version visuelle
│   └── social-media-brand-kit.zip
└── README.md
```

## Fonctionnalités du site

- **Page d'accueil** — Design responsive, français, optimisé mobile
- **Pourquoi nous** — Trois piliers : chaîne d'approvisionnement directe, contrôle qualité, service local
- **Modèles disponibles** — Volkswagen Lavida 2025, Geely Livan X3 Pro 2026 (prix en DZD + EUR)
- **Simulateur de coûts** — Calcul FOB → Fret maritime → Douane → TVA → Prix livré
- **Galerie visuelle** — Photos supply chain chinoise, équipe locale algérienne, vidéo logistique
- **Processus d'achat** — Étapes claires (Consultation → Acompte → Expédition → Livraison)
- **Contact / Devis** — Formulaire intégré + lien WhatsApp Business

## Identité de marque

| Élément | Détail |
|---------|--------|
| Nom | China Auto Algérie |
| Slogan | Votre voiture chinoise en Algérie |
| Couleur | #0F6E56 (teal foncé) |
| Réseaux sociaux | @chinaautoalgerie (Facebook, TikTok, Instagram) |
| Contact | WhatsApp Business + formulaire |

## Déploiement

Le site est un fichier HTML statique avec assets locaux. Aucun build step nécessaire.

### Options de déploiement

1. **GitHub Pages** — Activer dans Settings → Pages → branche `main`, dossier `/ (root)`
2. **CloudStudio** — Déjà déployé sur [app.codebuddy.work](https://a0a3a8dbae5240f48d482a37c5df31a0.app.codebuddy.work)
3. **EdgeOne Pages / Netlify / Vercel** — Connecter le repo, déploiement automatique

### Pour déployer sur GitHub Pages

```bash
# 1. Activer GitHub Pages dans le repo:
#    Settings → Pages → Source: "Deploy from a branch"
#    Branch: main, Folder: / (root)

# 2. Le site sera accessible à:
#    https://<username>.github.io/chinaautoalgerie/
```

## Personnalisation

Les éléments à remplacer avant mise en production :

- [ ] WhatsApp : remplacer `+213 XX XX XX XX` dans `index.html` (3 occurrences)
- [ ] Email : remplacer `contact@chinaautoalgerie.com`
- [ ] Adresse : ajouter l'adresse physique en Algérie
- [ ] Photos d'équipe : remplacer `images/team-algeria-local.png` par photo réelle
- [ ] Photos véhicules : remplacer par les photos réelles des modèles proposés

## Licence

Tous droits réservés — China Auto Algérie / 上海聚亿供应链
