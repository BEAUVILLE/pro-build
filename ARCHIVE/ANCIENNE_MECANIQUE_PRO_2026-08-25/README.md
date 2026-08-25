[README-LOT-VERITE-BUILD-20260710.txt](https://github.com/user-attachments/files/29908996/README-LOT-VERITE-BUILD-20260710.txt)[Uploading README-LOT-VERITE-LOT VÉRITÉ BUILD — 10 juillet 2026

PUBLIC BUILD
- index.html corrigé
- assets/babacar-plombier-pro.webp obligatoire
- go-pin.html remplacé par build-pro/pin.html
- disponibilité Babacar à confirmer directement
- Sénégal présenté comme preuve active ; France/diaspora comme ouverture en cours

BUILD PRO
- même pin.html et même guard.js conservés
- accès fail-closed : aucun mode local si le garde manque
- Oreille classe devis/service avant les notes et ne traite plus le mot client comme paiement
- stockage séparé à partir de l’identité/session validée
- traces BUILD présentées comme locales ; validation réelle dans PAY
- import JSON contrôlé, limité à 2 Mo, IDs régénérés
- confirmation avant suppression

POSE
1. Dépôt public BUILD : poser index.html ET le dossier assets/.
2. Dépôt BUILD PRO : remplacer seulement index.html. Garder pin.html, guard.js et assets/js/.
3. Le cloisonnement par artisan est le plus fort lorsque guard.js expose owner_id, user_id, artisan_id, profile_id, slug ou une session distincte.
BUILD-20260710.txt…]()

