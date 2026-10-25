# Contributing to CertiChain 🛡️

Thank you for your interest in contributing to **CertiChain**! Together, we are building the global standard for zero-trust, privacy-preserving academic credential verification on the blockchain.

---

## 🧭 Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Be respectful, constructive, and open to feedback.

---

## 🛠️ Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/codexanjan/certichain.git
cd certichain
npm install
```

### 2. Local Blockchain & Server Run
```bash
# Terminal 1: EVM Devnet
npm run node:chain

# Terminal 2: Smart Contract Deploy
npm run deploy:contract

# Terminal 3: Full Stack Dev Server
npm run dev
```

### 3. Running Automated Tests
Before submitting any pull request, ensure all 37 unit and integration tests pass:
```bash
# Full test suite
npm test

# Smart contract tests only
npm run test:contracts

# Cryptography and fraud engine tests
npm run test:backend
```

---

## 📌 Coding Standards & Conventions
- **Zero PII on Chain**: Under no circumstances should student names, student IDs, emails, or personal identifiers be stored in Solidity contract storage or emitted in unhashed event logs. Only cryptographic keys (`bytes32`) and SHA-256 document digests are permitted on-chain.
- **Defensive Error Handling**: Always catch edge cases, validate incoming hashes (`^[a-fA-F0-9]{64}$`), and ensure graceful fallback if the RPC blockchain provider is temporarily unreachable.
- **Accessibility & Design**: Any UI changes must adhere to the Obsidian Glassmorphism Design System, retain accessible contrast ratios, and preserve explicit `<label>` tags on all form inputs.

---

## 🚀 Submitting a Pull Request
1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Commit your changes: `git commit -m "feat: description of change"`
3. Push to your fork: `git push origin feat/your-feature-name`
4. Open a Pull Request referencing any related issues.
