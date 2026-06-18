# CleanAir Backoffice

Backoffice web pour gérer les brouillons d'intervention SAV et les envoyer vers Sage X3.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir http://localhost:4321

## Configuration

Copier `.env` et ajuster `PUBLIC_API_URL` :

```
PUBLIC_API_URL=http://193.95.53.114:4001
```

## Fonctionnalités

- Connexion (même API que l'app mobile `/api/users/login`)
- Liste des brouillons avec filtres (technicien, statut, type, dates, rapports)
- Détail complet intervention (parc, rapport final/brouillon, signatures, photos)
- Génération PDF (`POST /api/rapports/generaterapport`)
- Envoi vers X3 (`POST /api/interventiondrafts/:id/submit-to-x3`)

## Build

```bash
npm run build
npm run preview
```

## Production (PM2, port 6000)

Requires [PM2](https://pm2.keymetrics.io/) installed globally: `npm install -g pm2`

```bash
cp .env.example .env   # set PUBLIC_API_URL, then:
npm install
npm run deploy
```

This builds the site and starts (or restarts) the app on **http://localhost:6000**.

Other commands:

```bash
npm run pm2:start    # start without rebuilding
npm run pm2:restart  # restart running process
npm run pm2:stop     # stop
npm run pm2:logs     # view logs
pm2 save             # persist across reboots
```

After changing `.env`, run `npm run deploy` again so the new API URL is baked into the build.

## Note CORS

Le navigateur nécessite que l'API LoopBack autorise l'origine du backoffice (l'app mobile n'a pas cette contrainte).
