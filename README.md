# LabelX – A Decentralized Data Labeling Platform  
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)




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
```
### Create a .env file in the backend folder

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
JWT_SECRET=your_jwt_secret
```
### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
### Create a .env.local in the frontend folder

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## 📈 Impact & Vision

### 🌍 Global Inclusion  
Empowering contributors from around the world — even the unbanked — to participate using decentralized crypto wallets. This ensures that opportunity is not limited by geography or traditional banking systems.

### 💸 Auditable Payments  
All contributor payouts are executed **on-chain**, providing transparent, secure, and lightning-fast transactions. Every payment is verifiable and tamper-proof by design.

### 🔁 DAO-Ready Architecture  
The platform's architecture is designed with future decentralization in mind — supporting modules for **governance**, **staking**, and **incentive-based rewards** via tokenomics.

### 🧠 AI-Driven Future  
The roadmap includes native integrations with AI pipelines, making it easy to feed labeled data directly into ML workflows, enabling seamless AI model refinement.

---

## 🛠️ Challenges Faced

- ⚙️ **Async Payouts & Solana Signatures**  
  Building and debugging complex asynchronous payout pipelines while ensuring Solana signature verification was consistent and secure.

- 📤 **Media Upload Management**  
  Coordinating file uploads (Cloudinary & AWS S3) across roles like workers and validators required careful state handling and error resilience.

- 🧩 **Prisma Schema Modeling**  
  Designed a flexible and efficient relational schema to support multi-role task relationships using Prisma ORM.

- 🚨 **Backend 500 Errors**  
  Tackled elusive backend errors — often hard to reproduce — that demanded deep tracing, logging, and system-level debugging.

- 🪙 **Wallet Adapter Instabilities**  
  Addressed issues related to wallet connection, including Phantom popup failures and inconsistent adapter behavior across browsers.

---

## 💡 Behind the Build

This platform was the result of **weeks of deep development and testing**. From sleepless nights tracing async bugs to refining every API call and UI interaction, each commit moved the project closer to a seamless decentralized workflow.

Every obstacle turned into a learning curve — shaping not just the code, but the **vision for a more accessible and autonomous future in data labeling**.

---

## 🤝 Contributions

Pull requests are welcome!  
If you find a bug, have a feature request, or just want to contribute — feel free to fork the repo and open an issue to get started.

```bash
# Fork it
git clone https://github.com/DhrUboCodErReact/data-labeling-web3.git
cd data-labeling-web3
```

---

## 👨‍💻 About Me

Hi, I'm **Dhrubajyoti Das** – a final-year B.Tech student in **Electronics and Communication Engineering (ECE)**, graduating in **2025**.

I'm deeply passionate about:

- ⚙️ Building end-to-end full-stack systems  
- 🌐 Web3 applications on Solana  
- 🤖 Integrating AI into real-world workflows  
- 🧠 Problem solving through tech innovation  

This project is not just a codebase — it's a result of late-night debugging, countless commits, and a relentless drive to push boundaries in decentralized technology.


📬 Let’s connect:


- 💼 [LinkedIn](https://www.linkedin.com/in/dhrubajyoti-das-83b4662b6/)
- 🌐 [Portfolio](https://dhrubajyoti.netlify.app/)



Always open to collaboration, new ideas, and contributions.

