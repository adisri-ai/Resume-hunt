<div align="center">

# ResuNexus Free
### AI-Powered Resume Shortlisting Platform

<img src="/frontend/src/resunexus-logo.png" width="170"/>

<p align="center">

<img src="https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python"/>
<img src="https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge&logo=fastapi"/>
<img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react"/>
<img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb"/>
<img src="https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Groq-red?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Langchain-green?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Pydantic-blue?style=for-the-badge"/>
</p>

---

### 🌐 Live Demo
The [Live Demo](https://resunexus-frontend.vercel.app/) can be accessed from here.  
**Warning:**  Initially the login process could take upto 2 mins because of Render Free Tier limits.  
**Sample Credentials** : 
1. *email* : `user1@resunexus.com`
2. *password* : `user1`
---

### 📦 Original Cloud Version
This is the free version of the original cloud version which made use of Microsoft Azure Blob Storage and Premium models. 
🐳 Docker Repository

The link for accessing [docker repo](https://hub.docker.com/repository/docker/adisrinitw/resunexus2/general) of the original Azure Cloud-based project.

📂 GitHub Repository

The [GitHub Repository](https://github.com/adisri-ai/AI-based-Resume-Shortlisting-Agent) for the original Azure Cloud based project  

</div>

---

# 📖 Overview

This is a Free is an AI-powered Resume Intelligence Platform capable of automatically evaluating multiple resumes against a Job Description using Large 
Language Models.  

Instead of manually reviewing hundreds of resumes, recruiters simply upload

- A Job Description (PDF)
- A Resume (PDF) or ZIP containing hundreds of resumes

The application extracts required skills from the Job Description and intelligently scores every candidate across those skills before ranking them automatically.

The entire workflow completes within minutes while preserving explainability through skill-wise scoring.

---
# Use of Caching and asynchronous update to database:   
*CRUD* operations from database are usually very slow. To speed up the application we use **in-memory caching** ans **asynchronous update** to the database to make the application fast for the user.
# 🌟 Unique Features  

Traditional resume screening is

- Slow
- Subjective
- Error-prone
- Difficult to scale

ResuNexus automates this entire process using Generative AI while keeping recruiters in complete control of the final hiring decision.

---

# 🏢 Enterprise Origin

This repository is the **Free Community Edition** of a larger enterprise-grade Resume Intelligence Platform.

The original enterprise system was designed for production organizations and included:

- Azure Blob Trigger Functions
- Azure OpenAI GPT Models
- Event-driven architecture
- Automatic document ingestion
- Premium LLMs
- Enterprise scalability
- Azure Storage Queues
- Background processing
- Continuous resume monitoring

The architecture enabled completely autonomous resume processing as soon as files were uploaded to Azure Blob Storage.

---
# 🏗 Project Architecture

```
                    React Frontend
                          │
                          │
                    JWT Authentication
                          │
                          ▼
                   FastAPI Backend
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
      ▼                   ▼                   ▼
 Authentication     Resume Engine       Session Service
      │                   │                   │
      ▼                   ▼                   ▼
 MongoDB          Google Gemini         MongoDB
      │                   │
      ▼                   ▼
 User Data       AI Resume Evaluation
```
---

## Tech Stack

To make the project freely accessible, the architecture was redesigned.

Instead of relying on Azure premium infrastructure, the application now uses

- Groq Free Tier 
- FastAPI
- MongoDB Atlas Free Tier
- React
- Render Free Tier 
- Vercel 

This makes the project deployable entirely under free cloud limits.

---

# ✨ Features

## 🤖 AI Resume Screening

- Extracts skills directly from Job Description
- AI-powered resume evaluation
- Skill-wise candidate scoring
- Automatic ranking
- Total score calculation

---

## 📄 Job Description Analysis

- Upload PDF Job Description
- Automatic text extraction
- Intelligent skill identification
- Supports any role

Examples

- Software Engineer
- Data Scientist
- AI Engineer
- DevOps Engineer
- Product Manager

---

## 📂 Bulk Resume Processing

Supports

- Single PDF Resume
- ZIP containing hundreds of resumes

Automatically

- Reads every resume
- Extracts text
- Evaluates against JD
- Produces ranked results

---

## 📊 Intelligent Scoring

Every resume receives

```
Python....................8/10
Machine Learning..........9/10
Deep Learning.............7/10
FastAPI...................10/10
MongoDB...................8/10

Total Score...............42/50
```

---

## 📈 Automatic Ranking

Candidates are automatically sorted

Highest Score

↓

Lowest Score

---

## 📥 Excel Export

Generate recruiter-friendly Excel reports containing

- Candidate Name
- Individual Skill Scores
- Total Score

---

## 👤 Secure Authentication

- JWT Authentication
- Login
- Protected Routes
- Session Persistence
- MongoDB Session Storage

---

## 💾 Session Recovery

Each authenticated user has

- Saved Job Description
- Saved Skills
- Resume Results
- Processed Files

Users can leave the application and continue exactly where they left off.

---

## ⚡ Real-time Progress Tracking

The backend continuously tracks

- Total resumes
- Processed resumes
- Current progress

allowing the frontend to display live processing status.

---

---

# 📂 Project Structure

```
ResuNexus-Free

│
├── frontend
│   ├── components
│   ├── pages
│   ├── context
│   ├── services
│   └── assets
│
├── backend
│   ├── routes
│   ├── models
│   ├── processing
│   ├── llm_service
│   ├── database_service
│   ├── session_service
│   ├── authentication
│   └── app.py
│
└── README.md
```

---

# ⚙️ Technology Stack

## Frontend

- React 19
- React Router
- Tailwind CSS
- Lucide Icons
- Motion Animations
- Axios

---

## Backend

- FastAPI
- Uvicorn
- Pydantic
- JWT
- Passlib
- Python

---

## AI

- Groq Free Models
- Langchain
- Pydantic for parsing

---

## Database

- MongoDB Atlas

---

## Authentication

- JWT Tokens
- Access Tokens
- Password Hashing
- Protected APIs

---

## Deployment

Frontend

- Vercel

Backend

- Render

Database

- MongoDB Atlas

---

# 🔄 Resume Processing Workflow

```
Upload JD
      │
      ▼
Extract Text
      │
      ▼
AI Skill Extraction
      │
      ▼
Upload Resume(s)
      │
      ▼
Extract Resume Text
      │
      ▼
Gemini Evaluation
      │
      ▼
Skill-wise Scores
      │
      ▼
Ranking
      │
      ▼
Excel Export
```

---

# 🔐 Authentication Flow

```
Register/Login

       │

       ▼

JWT Token Generated

       │

       ▼

Stored in Browser

       │

       ▼

Protected API Requests

       │

       ▼

Backend Validation

       │

       ▼

Resume Processing
```

---

# 📊 Example Output

| Resume | Python | FastAPI | SQL | ML | Total |
|---------|--------|----------|-----|-----|-------|
| Candidate A | 9 | 8 | 7 | 10 | **34** |
| Candidate B | 8 | 7 | 8 | 9 | **32** |
| Candidate C | 6 | 8 | 6 | 7 | **27** |

---

# 🚀 Future Improvements

- Multi-user Dashboard
- Recruiter Analytics
- Candidate Feedback
- AI Interview Question Generator
- Resume Summarization
---
