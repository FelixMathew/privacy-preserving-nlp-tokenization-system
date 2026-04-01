# 🧠 Privacy-Preserving NLP Tokenization System

## 🔍 Overview
This project presents a **privacy-aware data processing system** that utilizes **Natural Language Processing (NLP)** principles to identify and protect sensitive information across multiple domains.

The system processes structured datasets (CSV/Excel) from:

- 🏦 Banking Systems  
- 🏥 Healthcare Systems  
- 🎓 Educational Institutions  

Sensitive fields are detected and replaced with secure tokens, ensuring **data privacy without compromising usability**.

---

## 🎯 Objectives

- Identify sensitive data fields dynamically
- Apply selective tokenization
- Preserve non-sensitive data for analysis
- Ensure privacy compliance (PII protection)
- Support multiple real-world datasets

---

## 🚀 Key Features

- 🔐 **Selective Tokenization**
  - Only critical fields are tokenized
- 📊 **Multi-Domain Dataset Support**
  - Bank, Hospital, Student data
- ⚡ **Real-Time File Processing**
  - Upload → Process → Display
- 🧠 **NLP-Based Pipeline**
  - Structured + semi-structured data handling
- 🛡️ **Privacy Preservation**
  - Protects Personally Identifiable Information (PII)

---

## ⚙️ Tech Stack

### Backend
- Python
- Flask
- Pandas

### Frontend
- React (Vite)
- Tailwind CSS

### Utilities
- UUID (Token Generation)
- CSV / Excel Parsing

---

## 📂 Dataset Structure

### 🏦 Bank Dataset
Sensitive Fields:
- Card Number
- CVV
- Account Number

---

### 🏥 Hospital Dataset
Sensitive Fields:
- Patient ID
- Medical History
- Prescription
- Insurance Number

---

### 🎓 Student Dataset
Sensitive Fields:
- Register Number
- Internal Marks
- External Marks
- CGPA

---

## 🧠 Algorithm

### 🔹 Approach:
The system uses **rule-based sensitive field detection** combined with token generation.

### 🔹 Steps:
1. Upload CSV/Excel file  
2. Convert data into Pandas DataFrame  
3. Identify sensitive columns  
4. Generate unique tokens using UUID  
5. Replace sensitive values  
6. Return processed dataset  

---
## 🛠️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/FelixMathew/privacy-preserving-nlp-tokenization-system.git
cd privacy-preserving-nlp-tokenization-system
2️⃣ Backend Setup
cd backend
pip install flask flask-cors pandas openpyxl
python app.py
3️⃣ Frontend Setup
cd frontend
npm install --legacy-peer-deps
npm run dev
📊 Usage
Upload CSV or Excel file
System detects sensitive fields
Tokenization is applied
Output is displayed in UI
📌 Applications
🔐 Secure Data Processing Systems
🏦 Banking Data Protection
🏥 Healthcare Record Privacy
🎓 Academic Data Security
🧠 Privacy-Aware NLP Systems
🔐 Why Tokenization?

Tokenization replaces sensitive data with random tokens, ensuring:

Data cannot be misused
Original values remain protected
System remains functional for analytics

📜 License
This project is licensed under the MIT License.

👨‍💻 Author
Felix Mathew
B.Tech CSE (Cloud Computing)
SRM Institute of Science and Technology



