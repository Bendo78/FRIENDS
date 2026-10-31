# FRIENDS — le jeu télé entre potes

> Qui connaît le mieux son pote ? Le charbon est chaud, les questions aussi.

Un plateau d'émission dans le navigateur : canapés rouges, projecteurs qui suivent
le candidat interrogé, ardoises qui se retournent, bulles de dialogue, chrono, tampons
« Bonne réponse / Raté / Justificatif accepté », classement final.

- **Présentateur** : crée la room, choisit le duo, le candidat, la question, la réponse sur sa fiche,
  le chrono et les points, puis rend son verdict.
- **Candidats** (sur leur téléphone) : rejoignent avec le code, s'assoient à côté de leur partenaire,
  écrivent sur leur ardoise, envoient des réactions en bulles.
- **Écran plateau** : à ouvrir sur la télé / le vidéoprojecteur (le plateau seul, en grand).

- **Co-présentateur** (facultatif) : un ami tape le code et choisit « Co-animer ». Il apparaît debout
  à droite du plateau, parle en bulles, lance l'ambiance du public (applaudissements, « Ohhh ! », rires,
  roulement de tambour) et voit la fiche du présentateur. Le présentateur peut le retirer.

Chacun personnalise son personnage sur l'accueil, en quatre onglets :
- **Corps** : sexe (♀ / ♂), peau, couleur des yeux ;
- **Cheveux** : 15 coiffures (court, houppette, rasé, carré, frange, long, chignon, queue, couettes,
  tresses, bouclés, afro, dreads, crête, chauve) et 14 couleurs ;
- **Tenue** : 17 tenues (t-shirt, débardeur, chemise, polo, col roulé, sweat, sweat à capuche, veste en jean,
  blouson cuir, costume, robe, paillettes, salopette, maillot de foot, peignoir, maillot de bain,
  tout nu avec mosaïque de censure façon télé) et 12 couleurs ;
- **Accessoires** : visage (lunettes, solaires, maquillage, taches de rousseur, moustache, barbe, cache-œil…),
  tête (casquette, bonnet, chapeau, couronne, cornes, auréole…), cou et oreilles (nœud pap', cravate,
  perles, chaîne en or, boucles d'oreilles, écharpe, casque audio).

Ça reste modifiable au salon (« Modifier »).

Le plateau est en profondeur, de **2 à 10 duos**. Jusqu'à 4 duos, les estrades sont en arc sur une rangée ;
de 5 à 10, sur deux rangées (devant et au fond). Le présentateur et le co-présentateur sont debout au
premier plan, devant le public.

Aucune installation pour les joueurs : un lien suffit.

---

## Les questions : ton Google Form

1. Crée un **Google Form**. Première question : **« Ton prénom »** (réponse courte). Ensuite, ajoute tes
   questions, posées sur soi-même : « Quel est ton plat préféré ? », « Ta plus grande peur ? »…
2. Envoie le formulaire aux joueurs avant la soirée : chacun écrit son prénom et répond.
3. Dans le formulaire, onglet **Réponses** → **Associer à Sheets** : ça crée la feuille de réponses.
4. Dans la feuille : **Partager** → accès général **« Tous les utilisateurs disposant du lien »** (lecteur).
   Copie le lien.
5. Dans le jeu, au salon, colle ce lien dans **« Questions du formulaire »** → **Importer**.
   Pas de partage possible ? *Fichier › Télécharger › CSV*, puis choisis le fichier.

Pendant l'émission, dans « La question », l'onglet **Formulaire** liste toutes les questions du formulaire.
Quand tu en choisis une, le menu **« Réponse de »** te laisse choisir le prénom du joueur dont la réponse
s'affiche sur ta fiche. Le jeu présélectionne le partenaire du candidat interrogé si les prénoms
correspondent ; tu peux toujours changer. Tu peux aussi reformuler la question à l'écran
(« Quel est le plat préféré de Karim ? ») sans perdre la réponse.

Le bouton **« Recharger les réponses »** relit la feuille si des joueurs répondent au dernier moment.
L'onglet **Mes questions** garde les questions que tu écris en direct (« Enregistrer dans mes questions »),
et l'onglet **Banque** contient 45 questions toutes prêtes.

Les réponses du formulaire restent sur l'appareil du présentateur. Les candidats ne les reçoivent pas ;
seul le co-présentateur voit la réponse attendue.

---

## 1. Tester tout de suite (tout seul, sur ton PC)

Double-clique sur **`lancer.bat`** (Node.js doit être installé) → ça ouvre http://localhost:5190.

Sans Supabase, le jeu est en **mode local** : ça marche entre plusieurs **onglets du même navigateur**.
Ouvre un onglet « Présentateur », puis d'autres onglets avec le lien `?r=CODE` pour les candidats.

---

## 2. Jouer en ligne (chacun sur son téléphone) — Supabase gratuit

On utilise seulement **Supabase Realtime (Broadcast)** : pas de base de données, pas de table à créer.

1. Va sur https://supabase.com → crée un compte → **New project** (offre Free).
2. Une fois le projet prêt : **Project Settings → API** (ou **Data API / API Keys**).
3. Copie :
   - **Project URL** (ex. `https://abcdxyz.supabase.co`)
   - la clé **anon / public** (une longue clé `eyJ...` ou `sb_publishable_...`)
4. Colle-les dans **`js/config.js`** :
   ```js
   export const CONFIG = {
     SUPABASE_URL: "https://abcdxyz.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi...",
   };
   ```
5. Dans **Realtime → Settings**, vérifie que l'accès aux canaux publics est autorisé
   (option « Allow public access » activée, c'est le réglage par défaut).

La clé « anon public » est faite pour être visible dans une page web : pas de souci à la mettre là.
Ne mets **jamais** la clé `service_role` / secrète.

La page d'accueil affiche alors 🟢 « En ligne (Supabase) ».

---

## 3. Mettre le site en ligne (gratuit)

Le jeu est un site statique (HTML/CSS/JS), donc n'importe quel hébergeur gratuit marche :

- **Netlify Drop** (le plus simple) : https://app.netlify.com/drop → glisse le dossier `coeur-a-coeur`.
  Tu obtiens une adresse du type `https://ton-jeu.netlify.app`.
- **GitHub Pages** : pousse le dossier sur un dépôt GitHub → Settings → Pages → branche `main`.
- **Cloudflare Pages** ou **Vercel** : même principe.

Ensuite : le présentateur ouvre le site → « Créer une émission » → envoie le lien affiché
(`…/?r=CODE`) aux candidats. La télé ouvre « Écran plateau » avec le même code.

---

## 4. Déroulé d'une émission

Le principe : on interroge un candidat sur son partenaire, et il doit donner la même réponse que lui.

1. **Salon** : les candidats arrivent et choisissent leur place (2 à 10 duos). Le présentateur peut aussi
   les placer, retirer quelqu'un, et importer les réponses du formulaire.
2. **Préparation** : dans « Qui interroger ? », le présentateur choisit **n'importe quel candidat,
   dans l'ordre qu'il veut** (le petit « 2× » indique combien de fois chacun a déjà été interrogé).
   Il choisit ensuite :
   - la **manche** : Manche 1 (1 pt), Manche 2 (2 pts) ou Finale (3 pts), affichée sur le plateau ;
   - la question : formulaire, mes questions ou banque, modifiable librement ;
   - la réponse sur sa fiche : menu « Réponse de » quand le formulaire est importé ;
   - le chrono.
   Option : faire écrire la vraie réponse **en secret** par le partenaire sur son téléphone.
3. **Question** : projecteurs sur le candidat, chrono sur le mur LED. Il écrit sur son ardoise ; le
   présentateur voit ce qu'il tape en direct.
4. **Révélation** : l'ardoise se retourne. C'est le moment des **OBJECTIONS** : un candidat d'un
   **autre duo** appuie sur le gros bouton rouge « OBJECTION ! ». Tout le plateau tremble, la bulle explose
   à l'écran, puis il écrit sa réponse, qui apparaît en bulle au-dessus de lui.
5. **Verdict** : Bonne réponse, Mauvaise, Justificatif accepté, ou **« Le point pour Duo N »** sur une
   objection. Dans ce cas, le duo qui a objecté **vole les points** (tampon « Point volé ! »). Une
   objection peut aussi être rejetée (« Objection rejetée »).
6. **Question suivante** : le présentateur choisit librement qui interroger ensuite.
7. **Fin de l'émission** : classement sur le mur LED.

Pendant toute l'émission, les candidats peuvent envoyer des réactions toutes prêtes ou **leur propre message**,
qui s'affiche en bulle au-dessus de leur personnage.

Le présentateur peut recharger sa page : « Reprendre l'émission » restaure tout.
Un candidat qui recharge revient automatiquement à sa place.

---

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil + écran de jeu |
| `css/stage.css` | Le plateau (décor, canapés, projecteurs, ardoises, bulles…) |
| `css/ui.css` | Interface (accueil, panneaux présentateur/candidat) |
| `js/app.js` | Logique de jeu, rôles, panneaux |
| `js/stage.js` | Rendu et animations du plateau |
| `js/avatar.js` | Personnages en SVG (personnalisation) |
| `js/icons.js` | Icônes de l'interface |
| `js/net.js` | Réseau : Supabase Realtime ou mode local |
| `js/questions.js` | Banque de questions (ajoute les tiennes ! `{p}` = prénom du partenaire) |
| `js/sheet.js` | Lecture des réponses du Google Form (Google Sheets / CSV) |
| `js/sound.js` | Jingles synthétisés |
| `js/config.js` | Tes clés Supabase |

## Et un .exe ?

Le site fait déjà tout et les téléphones n'ont rien à installer. Si tu veux quand même une appli
Windows pour l'écran du présentateur ou la télé, on peut emballer ce même dossier avec
Electron ou Tauri plus tard.
