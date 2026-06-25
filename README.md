# Secure File Vault

Coffre-fort de fichiers sécurisé : authentification JWT, chiffrement **AES‑256** au repos, gestion fine des permissions, journal d'audit, et scan de vulnérabilités **Trivy** intégré au pipeline CI/CD. Projet 5/5 du portfolio DevOps — axe **DevSecOps**.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Jenkins Pipeline                            │
│  [Test] → [Build Image] → [Trivy Scan]       │
│        CRITICAL → FAIL · sinon → Docker Hub  │
└─────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │      Secure File Vault     │
        │  React :3000               │
        │       │                    │
        │  Node.js / Express :5000   │
        │       │                    │
        │  ┌────┴────┐   /uploads     │
        │  │ MongoDB │   (chiffré)    │
        │  └─────────┘                │
        └────────────────────────────┘
```

## Stack

React (Vite + Tailwind) · Node.js + Express · MongoDB (Mongoose) · JWT · AES‑256 (crypto natif) · Multer · Helmet · Trivy · Jenkins

## Fonctionnalités

- **Auth** : register / login / logout, JWT d'accès (1h) + refresh token (7j, rotation), rôles user/admin
- **Upload** : drag & drop, types autorisés (pdf, txt, docx, png, jpg), max 10 Mo, nom de fichier nettoyé (anti path traversal)
- **Chiffrement** : AES‑256‑GCM à l'upload, déchiffrement au download, clé jamais exposée via l'API
- **Permissions** : Private / Shared (lien à token) / Public ; l'admin voit et supprime tout
- **Audit log** : chaque action (upload, download, delete, changement de permission) est tracée (user, action, fichier, timestamp, IP)
- **DevSecOps** : Trivy scanne l'image à chaque build, échec si vulnérabilité CRITICAL

## État d'avancement

- [x] Backend — fondation + authentification (JWT + refresh + rôles)
- [ ] Backend — upload + chiffrement AES-256 + permissions
- [ ] Backend — audit log + routes admin
- [ ] Frontend React
- [ ] Dockerfile + docker-compose
- [ ] Jenkinsfile (stage Trivy) + SonarQube

## Démarrage (backend, Phase A)

```bash
cd backend
npm install
cp .env.example .env
# générer une clé AES-256 :
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run dev   # http://localhost:5000
```

Nécessite une instance MongoDB accessible via `MONGODB_URI`.

### Endpoints d'authentification

| Méthode | Route                | Description                          |
|---------|----------------------|--------------------------------------|
| POST    | `/api/auth/register` | Créer un compte                      |
| POST    | `/api/auth/login`    | Connexion → access + refresh tokens  |
| POST    | `/api/auth/refresh`  | Rotation du refresh token            |
| POST    | `/api/auth/logout`   | Révoque le refresh token (protégé)   |
| GET     | `/api/auth/me`       | Profil courant (protégé)             |
