# Deployment Guide — CertiChain

## 1. Local Development Setup

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose (optional; zero-config SQLite mode included for instant local run)

### Step-by-Step Local Startup
1. **Clone and Install Dependencies**:
   ```bash
   git clone <repo-url> certichain
   cd certichain
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to root `.env` (or configure workspace env files):
   ```bash
   cp .env.example .env
   ```

3. **Start Local Hardhat Blockchain**:
   In terminal 1:
   ```bash
   npm run node:chain
   ```
   *Runs a local EVM network at `http://127.0.0.1:8545` with pre-funded accounts.*

4. **Deploy Smart Contract**:
   In terminal 2:
   ```bash
   npm run deploy:contract
   ```
   *Deploys `CertificateRegistry.sol` to local chain and outputs contract address to `.env`.*

5. **Start PostgreSQL Database**:
   ```bash
   docker compose up -d
   ```
   *(If running without Docker, CertiChain seamlessly falls back to a persistent local development SQLite store).*

6. **Run Database Migrations & Seeds**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   *Seeds Super Admin (`admin@certichain.io`), Demo Institutions, and Sample Students.*

7. **Start Full-Stack Development Servers**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api/v1`
   - Socket.IO Hub: `http://localhost:5000`

---

## 2. Cloud / Production Deployment Architecture
- **Frontend**: Deploy to Vercel, Netlify, or AWS CloudFront/S3. Set `VITE_API_URL` to production backend domain.
- **Backend**: Containerize using Docker and host on AWS ECS, Render, Railway, or Google Cloud Run.
- **Database**: Managed PostgreSQL instance (AWS RDS, Neon, or Supabase).
- **Blockchain**: Polygon Amoy Testnet, Ethereum Sepolia, or Base Sepolia.
- **Object Storage**: AWS S3 or Google Cloud Storage with private buckets and signed URLs.
