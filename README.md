# 🧠 Decentralized Data Labeling Platform (Web3 + Solana)

A capstone project that brings decentralization to AI dataset labeling using Web3 technologies and the Solana blockchain. This platform enables real-time, secure, and transparent micropayments in SOL for annotators — eliminating intermediaries and empowering global contributors.

---

## 🚀 Project Summary

High-quality labeled data is vital for AI/ML applications, but traditional annotation platforms are centralized, expensive, and opaque. This project presents a decentralized alternative by leveraging blockchain, cloud-native storage, and wallet-based authentication.

> 🎯 Built as part of my B.Tech Final Year Capstone Project, this proof-of-concept demonstrates the potential of Web3 to drive innovation in digital labor infrastructure.

---

## 🔍 Core Features

- **🔐 Decentralized Authentication:**  
  Sign in with Phantom or any Solana-compatible wallet. No username or password required.

- **💸 Blockchain Micropayments:**  
  Contributors are paid instantly in SOL for each successfully verified task using Solana’s low-fee blockchain.

- **🧑‍💼 Role-Based Dashboards:**  
  - **Requester:** Upload and manage image-labeling tasks.
  - **Annotator:** Claim tasks, annotate images, and receive SOL.
  - **Validator:** Review and approve annotations for quality assurance.

- **☁️ Scalable Media Storage:**  
  Uploads are stored securely via **AWS S3** and delivered through **CloudFront** for high performance.

- **⚙️ Background Workers & REST APIs:**  
  Handle task scheduling, verification pipelines, and payment automation.

---

## 🧱 Tech Stack

| Layer        | Technology |
|--------------|------------|
| **Frontend** | React.js, Next.js, Tailwind CSS, TypeScript |
| **Backend**  | Node.js, Express.js |
| **Blockchain** | Solana Web3.js, Solana Wallet Adapter |
| **Database** | PostgreSQL + Prisma ORM |
| **Storage**  | AWS S3, CloudFront |
| **DevOps**   | GitHub, Postman, Vercel |

---

## 🧑‍💻 Developer Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Phantom Wallet (for testing)
- Solana CLI (optional)
- AWS credentials for S3/CloudFront (if using media upload)

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

