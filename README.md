# DIGIY Mes services PRO — Oreille Métier

Module PRO DIGIYLYFE pour les services terrain : demandes client, devis, chantier, rendez-vous, acomptes, messages et fiche service.

Ce dépôt suit la doctrine Oreille Métier validée le 24 mai 2026.

---

## Nom visible

`BUILD` reste seulement un code interne.

Dans les pages visibles, on écrit :

- Mes services
- Mon service
- Ma fiche service
- Mes demandes
- Mes devis
- Mes notes
- Ma session
- Mon argent
- Oreille Mes services

On n’affiche pas “BUILD” au professionnel quand ce n’est pas nécessaire.

---

## Doctrine du jour

### Une page = un sujet

Chaque page garde son rôle. On ne mélange pas navigation, session, fiche, cockpit et travail vocal.

- `index.html` : porte courte d’entrée / compatibilité.
- `hub.html` : navigation principale en pavés terrain.
- `session.html` : accès, session, nettoyage local, retour sécurisé.
- `oreille.html` : seule vraie page de travail vocal.
- `cockpit.html` : demandes, devis, notes, chantier, suivi service.
- `profile.html` : fiche service du professionnel.
- `fiche.html` : structure fiche / façade service selon usage.
- `qr.html` : QR et accès public.

Le hub oriente. La page agit.

---

## Règle Oreille Métier

L’Oreille Mes services ne doit pas être chargée partout.

### Autorisé

`oreille.html` charge les scripts Oreille :

```html
<script src="./assets/js/oreille-metier-core.js" defer></script>
<script src="./assets/js/oreille-services.js" defer></script>
```

### Interdit

Ne jamais charger les scripts Oreille dans :

- `hub.html`
- `session.html`
- `index.html`
- `cockpit.html`
- `profile.html`
- `fiche.html`
- `qr.html`

Ces pages peuvent seulement ouvrir l’Oreille avec un lien clair :

```html
<a href="./oreille.html">🎙️ Oreille Mes services</a>
```

---

## Moule technique validé

Chaque module DIGIYLYFE suit ce moule :

```txt
assets/js/oreille-metier-core.js
assets/js/oreille-[module].js
oreille.html
hub.html
session.html
```

Pour Mes services :

```txt
assets/js/oreille-metier-core.js
assets/js/oreille-services.js
oreille.html
hub.html
session.html
```

L’ancien fichier `oreille-metier-mes services.js-old` reste archivé. Il ne doit pas être appelé dans les pages.

---

## Doctrine visuelle téléphone

Oreille doit être visible, grande et grasse.

Sur téléphone :

- le titre Oreille doit être très lisible ;
- les boutons doivent être grands ;
- les suggestions doivent être en pavés, idéalement 2 par 2 ;
- le pro doit pouvoir taper avec le pouce ;
- éviter les longues colonnes qui fatiguent ;
- moins d’écriture, plus de clics.

---

## Ce que fait l’Oreille Mes services

Elle peut aider à préparer :

- une nouvelle demande client ;
- un devis à préparer ;
- une note chantier ;
- un rendez-vous à proposer ;
- un acompte ou solde à vérifier ;
- un message WhatsApp ;
- une relance client ;
- un brouillon sans engagement.

Le pro parle ou clique. DIGIY met en forme. Le pro valide. Le logiciel range.

---

## Limites protégées

Rien n’est confirmé automatiquement :

- pas de devis confirmé automatiquement ;
- pas de prix figé automatiquement ;
- pas de rendez-vous confirmé automatiquement ;
- pas de chantier promis automatiquement ;
- pas d’acompte ou solde confirmé automatiquement ;
- pas de promesse client envoyée sans validation ;
- pas de paiement considéré comme reçu sans preuve vérifiée.

Mes services aide à préparer. Le terrain garde la main.

---

## Accès et sécurité

- Entrée courte : `index.html`.
- Navigation principale : `hub.html`.
- Porte sécurisée : `pin.html` / `go-pin.html` selon le parcours.
- Protection : `guard.js`.
- Session locale : environ 8h.
- Ne pas afficher de téléphone ou d’identifiant sensible dans l’URL.
- Garder les routes existantes tant qu’il n’y a pas de bug réel.

---

## Routes importantes

```txt
./index.html
./hub.html
./session.html
./oreille.html
./cockpit.html
./profile.html
./fiche.html
./qr.html
./pin.html
./go-pin.html
```

---

## Test de fermeture terrain

Après chaque correction, tester sur téléphone :

1. ouvrir `index.html` ;
2. vérifier que l’entrée mène proprement vers le parcours prévu ;
3. entrer par PIN si nécessaire ;
4. arriver sur `hub.html` ;
5. ouvrir `oreille.html` depuis le hub ;
6. vérifier que `hub.html` ne charge pas les scripts Oreille ;
7. ouvrir `session.html` ;
8. vérifier que `session.html` ne charge pas les scripts Oreille ;
9. tester `cockpit.html`, `profile.html`, `fiche.html`, `qr.html` ;
10. vérifier que les suggestions Oreille sont en pavés téléphone.

---

## Signature DIGIYLYFE

Mes services doit rester simple, mobile, lisible et terrain.

Le client demande. Le pro parle ou clique. DIGIY prépare. Le pro valide. Le logiciel garde la trace.

**Le terrain garde la main.**
