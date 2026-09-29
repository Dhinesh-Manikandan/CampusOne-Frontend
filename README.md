# CampusOne - React Frontend

Frontend user interface for **CampusOne** (Gather Campus Event Management Platform). Built with React 18, Vite, and modern CSS/Tailwind utilities. Designed for integration with a separate Spring Boot REST API backend in a DevOps CI/CD pipeline using Docker and Jenkins.

---

## 1. Project Overview & Architecture

* **Framework:** React 18.3.1 (SPA with `react-router-dom`)
* **Build Tool:** Vite 5.4.10
* **Package Manager:** npm (with `package-lock.json`)
* **Production Web Server:** Nginx 1.27 Alpine
* **Target Container Port:** 80 (HTTP)
* **Dev Server Port:** 3000

---

## 2. Local Development Setup

### Prerequisites
* **Node.js:** v18+ or v20+ / v22+
* **npm:** v9+ or v10+

### Installation & Running Locally
```bash
# 1. Install exact dependencies
npm ci

# 2. Start the local development server (runs on http://localhost:3000)
npm run dev

# 3. Create a production build locally (outputs to /dist)
npm run build

# 4. Preview the local production build
npm run preview
```

---

## 3. Environment Variables & Backend API Configuration

The frontend communicates with the backend Spring Boot API via `src/services/apiClient.js`.

### Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | Base URL path or full URL for the backend Spring Boot REST API |
| `VITE_APP_NAME` | `Gather` | Display application title |
| `VITE_ENABLE_ANALYTICS` | `false` | Enable/disable client-side analytics flag |

### How Backend API is Handled in Production (Docker)
1. **Default & Recommended (Relative `/api`):**
   * By default, `VITE_API_BASE_URL` is set to `/api`.
   * In a Docker / reverse-proxy setup (or Kubernetes ingress), Nginx or the ingress forwards `/api/*` to the Spring Boot backend (`http://backend:8080/api/*`).
   * This completely eliminates browser CORS issues.
2. **Build-Time Custom URL:**
   * Because Vite embeds `VITE_*` variables into the static JavaScript bundle during `npm run build`, you can supply a custom backend URL at build time:
   ```bash
   docker build --build-arg VITE_API_BASE_URL=http://your-backend-ip:8080/api -t dhineshmanikandan2006/campusone-frontend:latest .
   ```

---

## 4. Docker Deployment

### Multi-Stage Dockerfile Architecture
1. **Stage 1 (Builder):** Uses `node:22-alpine` to run `npm ci` and `npm run build`, producing optimized static assets in `/app/dist`.
2. **Stage 2 (Production):** Uses lightweight `nginx:1.27-alpine` to serve static assets with custom `nginx.conf` supporting SPA fallback routing (`try_files $uri $uri/ /index.html;`).

### Docker Commands

#### Build Docker Image Locally
```bash
# Standard build (uses default /api base URL)
docker build -t dhineshmanikandan2006/campusone-frontend:latest .

# Build with custom backend API URL
docker build --build-arg VITE_API_BASE_URL=http://backend-host:8080/api -t dhineshmanikandan2006/campusone-frontend:latest .
```

#### Run Docker Container
```bash
docker run -d -p 80:80 --name campusone-frontend dhineshmanikandan2006/campusone-frontend:latest
```

* **Application URL:** [http://localhost](http://localhost) (or port 80 of your host/server).
* To stop and remove:
  ```bash
  docker stop campusone-frontend && docker rm campusone-frontend
  ```

---

## 5. Jenkins CI/CD Pipeline

The included `Jenkinsfile` implements an automated Declarative Pipeline:

```
[Checkout Code]
       ↓
[Install Dependencies] (npm ci)
       ↓
[Run Tests] (npm test --if-present)
       ↓
[Build React App] (npm run build)
       ↓
[Build Docker Image] (tagged with build number & latest)
       ↓
[Login to Docker Hub] (using Jenkins Credentials)
       ↓
[Push Docker Image] (pushes tags to Docker Hub repository)
```

### Required Jenkins Credentials
* **Credential Type:** Username with password
* **Credential ID:** `docker-hub-credentials`
* **Username:** Your Docker Hub username (e.g., `dhineshmanikandan2006`)
* **Password:** Docker Hub Personal Access Token (PAT) or password

### Docker Hub Repository
* Default image repository: `dhineshmanikandan2006/campusone-frontend`
* You can update `DOCKER_IMAGE_NAME` in `Jenkinsfile` if you use another Docker Hub account.
