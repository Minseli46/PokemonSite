# Guide de Déploiement - Pokédex Full-Stack

Ce guide explique comment déployer l'application en production.

## 🌐 Options de Déploiement

### Option 1 : Vercel (Frontend) + Railway/Render (Backend) - **Recommandé**

#### Frontend sur Vercel

1. **Préparer le projet**
```bash
cd frontend
```

2. **Installer Vercel CLI**
```bash
npm i -g vercel
```

3. **Déployer**
```bash
vercel
```

4. **Configuration Vercel**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

5. **Variables d'environnement**
```env
NEXT_PUBLIC_API_URL=https://votre-backend.railway.app
```

#### Backend sur Railway

1. **Créer un compte** sur [Railway.app](https://railway.app)

2. **Nouveau projet**
- Connecter GitHub repo
- Sélectionner le dossier `backend/`

3. **Ajouter PostgreSQL**
- Add Service → Database → PostgreSQL
- Railway génère automatiquement `DATABASE_URL`

4. **Variables d'environnement**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
NODE_ENV=production
```

5. **Déployer**
```bash
# Railway détecte automatiquement package.json
# Build command: npm install && npx prisma generate && npx prisma migrate deploy
# Start command: npm start
```

---

### Option 2 : Vercel Full-Stack (Monorepo)

1. **Structure pour Vercel**
```json
// vercel.json à la racine
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "backend/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

2. **Déployer**
```bash
vercel
```

---

### Option 3 : AWS / DigitalOcean / VPS

#### Serveur Ubuntu

1. **Prérequis**
```bash
# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Installer PM2
sudo npm install -g pm2
```

2. **Cloner le projet**
```bash
git clone <url>
cd "Projet Pokemon"
npm run install:all
```

3. **Configuration PostgreSQL**
```bash
sudo -u postgres psql
CREATE DATABASE pokedex;
CREATE USER pokedex_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE pokedex TO pokedex_user;
\q
```

4. **Variables d'environnement**
```bash
# backend/.env
DATABASE_URL="postgresql://pokedex_user:votre_password@localhost:5432/pokedex"
PORT=3000
NODE_ENV=production

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://votre-serveur:3000
```

5. **Build**
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npm run build

cd ../frontend
npm run build
```

6. **PM2 Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'pokedex-backend',
      cwd: './backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'pokedex-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

7. **Démarrer avec PM2**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

8. **Nginx Reverse Proxy**
```nginx
# /etc/nginx/sites-available/pokedex
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pokedex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL/HTTPS avec Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## 📊 Monitoring

### Logs PM2

```bash
pm2 logs
pm2 logs pokedex-backend
pm2 logs pokedex-frontend
```

### Monitoring

```bash
pm2 monit
```

### Redémarrer

```bash
pm2 restart all
pm2 restart pokedex-backend
pm2 restart pokedex-frontend
```

---

## 🔄 Mise à Jour en Production

```bash
# Arrêter les services
pm2 stop all

# Mettre à jour le code
git pull origin main

# Réinstaller les dépendances si nécessaire
npm run install:all

# Backend
cd backend
npx prisma migrate deploy
npm run build

# Frontend
cd ../frontend
npm run build

# Redémarrer
cd ..
pm2 restart all
```

---

## ⚠️ Checklist Pré-Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données créée et migrée
- [ ] CORS configuré pour le domaine de production
- [ ] Secrets JWT générés
- [ ] SSL/HTTPS activé
- [ ] Logs configurés
- [ ] Monitoring en place
- [ ] Backups BDD configurés
- [ ] Tests passés
- [ ] Documentation à jour

---

## 🐛 Troubleshooting Production

### Backend ne démarre pas

```bash
# Vérifier les logs
pm2 logs pokedex-backend

# Vérifier la connexion BDD
cd backend
npx prisma db pull

# Régénérer Prisma Client
npx prisma generate
```

### Frontend erreurs 500

```bash
# Vérifier NEXT_PUBLIC_API_URL
cat frontend/.env.local

# Rebuild
cd frontend
rm -rf .next
npm run build
```

### Base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql -d pokedex

# Vérifier les tables
\dt

# Voir les migrations
SELECT * FROM "_prisma_migrations";
```

---

## 🌍 Variables d'Environnement par Environnement

### Development (Local)

```env
# Backend
DATABASE_URL="postgresql://user:pass@localhost:5432/pokedex"
PORT=3000
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Staging

```env
# Backend
DATABASE_URL=${{STAGING_DATABASE_URL}}
PORT=3000
NODE_ENV=staging

# Frontend
NEXT_PUBLIC_API_URL=https://api-staging.votre-domaine.com
```

### Production

```env
# Backend
DATABASE_URL=${{PRODUCTION_DATABASE_URL}}
PORT=3000
NODE_ENV=production
JWT_SECRET=${{PRODUCTION_JWT_SECRET}}

# Frontend
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

---

## 📦 Docker (Optionnel)

### Dockerfile Backend

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Dockerfile Frontend

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: pokedex
      POSTGRES_USER: pokedex
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://pokedex:password@postgres:5432/pokedex
      PORT: 3000
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3000
    ports:
      - "3001:3001"

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

---

**Bon déploiement ! 🚀**
