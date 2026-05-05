# DIGIY BUILD — Je propose mes services

Ce module fait partie de l’écosystème **DIGIYLYFE**.

Il aide les professionnels du terrain à présenter leurs services, recevoir des demandes, préparer des devis, suivre leur activité et garder une trace simple de leurs notes rapides vers **Mon argent**.

## Positionnement

**Je propose mes services** est l’espace DIGIY pour les artisans, prestataires, entrepreneurs multi-services et métiers de terrain.

Doctrine DIGIY :

- 0% commission
- paiement direct au professionnel
- présence digitale simple
- outils métier terrain
- souveraineté digitale africaine
- complément de WhatsApp, sans enfermer le client

## Accès sécurisé

L’accès professionnel passe par une session locale protégée.

Principes :

- entrée par `pin.html`
- session locale valable 8 heures
- navigation interne directe une fois la session ouverte
- retour naturel au PIN si la session est absente ou expirée
- téléphone et repère technique gardés dans le coffre local de l’appareil
- aucune donnée sensible dans la barre d’adresse

Règle façade :

- pas de `phone=` dans les URLs visibles
- pas de `tel=` dans les URLs visibles
- pas de `slug=` dans les URLs visibles
- pas de téléphone affiché en façade
- pas de lien support direct exposant un numéro dans les pages PRO

## Fichiers principaux

- `index.html`  
  Porte propre du module. Présente l’accès et oriente vers l’entrée sécurisée.

- `pin.html`  
  Porte d’entrée avec code d’accès. Ouvre une session locale de 8 heures.

- `guard.js`  
  Protège les pages métier. Nettoie les URLs visibles et maintient la session dans le coffre local.

- `dashboard-pro.html`  
  Accueil professionnel.

- `cockpit.html`  
  Page service : demandes, devis, suivi, notes rapides et aide-mémoire.

- `profile.html`  
  Page Plus : fiche service, visibilité, zone, contact métier et lien public.

- `profile.js`  
  Moteur de sauvegarde de la fiche service, avec brouillon local et sauvegarde Supabase.

- `go-pin.html`  
  Raccourci propre vers l’accès, sans propager de paramètres sensibles.

## Navigation interne

Une fois la session ouverte, le professionnel peut circuler directement entre :

- Accueil
- Demandes
- Service
- Notes
- Plus

Le PIN reste une porte d’entrée ou de secours.  
Il ne doit pas devenir une barrière répétée entre les pages internes.

## Notes rapides vers Mon argent

Le module permet d’écrire une phrase simple comme :

- dépannage plomberie 15000 cash
- achat ciment 12000
- avance client 50000 Wave
- client Moussa doit 20000

DIGIY prépare ensuite une trace lisible pour aider le professionnel à nourrir **Mon argent**.

Règle :

Une note rapide ne remplace pas la décision du professionnel.  
Elle prépare la trace. Le professionnel garde la main.

## Sécurité façade

Les pages visibles doivent rester humaines.

À éviter en façade :

- jargon technique
- téléphone visible
- slug visible
- paramètres sensibles dans l’URL
- support direct avec numéro exposé
- messages backend bruts

À privilégier :

- “code d’accès”
- “session active”
- “repère gardé dans le coffre local”
- “ouvrir mon espace”
- “retour à l’accueil”
- “service”
- “notes”
- “plus”

## Philosophie

DIGIYLYFE ne remplace pas le professionnel.

DIGIY prépare le chemin, clarifie la demande, garde le lien direct et aide le client à arriver chez le bon professionnel.

Le terrain garde la main.
