# ShopSense — Discovering Shopping Personalities Using Machine Learning

> **Academic Case Study for B.Tech Artificial Intelligence Coursework**  
> **Institution:** Department of Artificial Intelligence, School of Computer Science & Engineering, Vellore Institute of Technology  
> **Core Topic:** Unsupervised Learning &bull; Customer Segmentation &bull; RFM Behavioral Modeling &bull; K-Means Clustering  

---

## 1. Project Overview & Research Question

**ShopSense** is a complete, working academic case study demonstrating how unsupervised machine learning can discover natural customer shopping personalities from historical transaction logs without predefined target labels.

### Core Research Question:
> *"Can K-Means clustering, combined with RFM analysis, discover meaningful, reproducible customer shopping patterns from historical retail transactions, and can these patterns be translated into interpretable behavioral profiles?"*

The system demonstrates:
1. **Audited Data Cleaning:** Systematic filtering of cancellations, missing IDs, duplicates, and invalid prices with a rigorous step-by-step audit trail.
2. **RFM Feature Engineering:** Customer-level aggregation of Recency ($R$), Frequency ($F$), and Monetary ($M$) metrics against a fixed dataset horizon.
3. **Variance Normalization:** Log transformation (`np.log1p`) followed by `StandardScaler` to prevent extreme wholesale spenders from distorting centroids.
4. **Principled Model Selection:** Systematic evaluation of candidate $K \in [2, 8]$ using Inertia, Silhouette Score, Davies-Bouldin Index, Calinski-Harabasz Score, and cluster balance.
5. **Controlled Comparative Experiment:** Experiment A (Raw RFM) vs. Experiment B (Log-Transformed RFM), proving why raw features yield degenerate 0.3% outlier clusters.
6. **Plain-English Personality Profiles:** Dynamic generation of descriptive archetypes derived directly from observed cluster medians.
7. **Full-Stack Academic Application:** Fast, typed FastAPI backend paired with a minimalist, editorial React + TypeScript interface and interactive 2D PCA visualization.

---

## 2. Dataset Information

- **Dataset Name:** [UCI Online Retail Dataset (ID 352)](https://archive.ics.uci.edu/dataset/352/online+retail)
- **Original Authors:** Daqing Chen, Sai Liang Sain, and Kun Guo (2012)
- **Domain:** UK-based online non-store giftware retailer
- **Timeframe:** December 1, 2010 to December 9, 2011
- **Raw Dimensions:** 541,909 rows, 8 columns (`InvoiceNo`, `StockCode`, `Description`, `Quantity`, `InvoiceDate`, `UnitPrice`, `CustomerID`, `Country`)

### Cleaning Audit Summary:
| Cleaning Stage | Rows Excluded | Rows Remaining | Retention % | Academic Justification |
| :--- | :---: | :---: | :---: | :--- |
| **Raw Dataset** | - | 541,909 | 100.0% | Original UCI transaction log |
| **Step 1: Missing Customer ID** | 135,080 | 406,829 | 75.08% | Transactions cannot be attributed to a customer profile |
| **Step 2: Cancelled Invoices** | 8,905 | 397,924 | 73.43% | Invoices starting with 'C' indicate cancellations/refunds |
| **Step 3: Invalid Quantity/Price** | 40 | 397,884 | 73.42% | Zero or negative unit price and damaged goods entries |
| **Step 4: Exact Duplicates** | 5,192 | 392,692 | **72.46%** | Redundant duplicate system submissions |

- **Final Unique Customers:** **4,338**
- **Total Valid Purchase Revenue:** **£8,887,208.89**
- **Total Completed Orders:** **19,788**

---

## 3. Discovered Shopping Personalities ($K=4$)

| Personality Name | Population Share | Median Recency | Median Frequency | Median Spend | Distinguishing Behavioral Trait |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **High-Value Champions** | 709 (16.3%) | 8 days | 10 orders | £3,722.82 | Recent buyers with 5.6x median spending and steady cadence |
| **At-Risk Valuable Shoppers** | 1,173 (27.0%) | 55 days | 4 orders | £1,341.65 | Substantial historical revenue, but inactive for nearly 2 months |
| **Active Regular Shoppers** | 839 (19.3%) | 17 days | 2 orders | £466.70 | Frequent recent orders with modest basket values |
| **Dormant Low-Engagement** | 1,617 (37.3%) | 177 days | 1 order | £298.40 | Inactive for ~6 months, single low-value purchase |

*Population Medians for Baseline Comparison: Recency = 51.0 days, Frequency = 2.0 orders, Monetary = £668.57.*

---

## 4. Key Experimental Results: Raw vs. Log-Transformed Features

```
[Experiment A: Raw RFM + StandardScaler]
K=2: Silhouette 0.8958 | Min Cluster %: 0.6% (26 customers)
K=3: Silhouette 0.5942 | Min Cluster %: 0.6%
K=4: Silhouette 0.6162 | Min Cluster %: 0.3% (13 customers)
Finding: Deceptively high silhouette scores caused by extreme wholesale spenders
occupying isolated outlier clusters, leaving 90%+ in one undifferentiated group.

[Experiment B: Log-Transformed RFM (np.log1p) + StandardScaler] (SELECTED)
K=2: Silhouette 0.4328 | Min Cluster %: 38.4%
K=3: Silhouette 0.3365 | Min Cluster %: 17.7%
K=4: Silhouette 0.3375 | Min Cluster %: 16.4% (Selected Model)
Finding: Normalizes heavy right-skewed variance, generating four balanced,
interpretable, and operationally distinct retail customer segments.
```

- **PCA 2D Projection Explained Variance:** **93.87%** (PC1: 75.08%, PC2: 18.79%).

---

## 5. Technology Stack

- **Machine Learning & Analytics:** Python 3.11+, Scikit-learn, Pandas, NumPy, Joblib, SciPy, Matplotlib
- **Backend API:** FastAPI, Uvicorn, Pydantic v2
- **Frontend Application:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons
- **Academic PDF Engine:** ReportLab (producing a formal 7-page university report)
- **Testing:** Pytest, HTTPX

---

## 6. Project Directory Structure

```text
ShopSense/
├── backend/
│   ├── main.py                     # FastAPI entrypoint with 6 REST endpoints
│   ├── schemas.py                  # Pydantic v2 request/response schemas
│   ├── services/
│   │   ├── data_service.py         # Preprocessing audit data provider
│   │   ├── clustering_service.py   # Cluster profiles & PCA coordinate provider
│   │   └── prediction_service.py   # Real-time inference & outlier detector
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/             # Overview, Personalities, ClusterMap, BehindAI, Predictor, Methodology
│   │   ├── services/api.ts         # Type-safe API client
│   │   ├── types/api.ts            # TypeScript interfaces
│   │   ├── App.tsx                 # Root application component
│   │   └── index.css               # Editorial theme with Tailwind v4
│   ├── package.json
│   └── vite.config.ts
├── ml/
│   ├── download_data.py            # Reproducible UCI dataset downloader
│   ├── preprocess.py               # 4-stage data cleaning & RFM aggregator
│   ├── train.py                    # Candidate K evaluation, PCA, & artifact generator
│   ├── evaluate.py                 # Academic evaluation CLI
│   └── artifacts/                  # Fitted models, scalers, profiles, and PCA CSV
├── data/
│   ├── raw/Online Retail.xlsx      # Official 23.7 MB UCI dataset
│   └── processed/                  # Cleaned parquet, rfm_raw.csv, audit JSON
├── reports/
│   ├── figures/                    # 6 high-res academic figures (300 DPI)
│   ├── generate_report.py          # ReportLab 7-page PDF generator
│   ├── ShopSense_AI_Case_Study.pdf # Mandatory university deliverable
│   └── VIVA_NOTES.md               # 12 viva questions & faculty Q&A guide
├── tests/
│   ├── test_rfm_and_model.py       # RFM logic & model artifact tests
│   └── test_api.py                 # FastAPI endpoint validation tests
├── README.md
└── .gitignore
```

---

## 7. Setup & Execution Guide

### Prerequisites
- Python 3.11+ installed and accessible via `python`
- Node.js 18+ and npm installed and accessible via `npm`

### Step 1: Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 2: Verify / Download Dataset
```bash
python ml/download_data.py
```
*(If offline, ensure `Online Retail.xlsx` is placed in `data/raw/`)*

### Step 3: Run Data Preprocessing
```bash
python ml/preprocess.py
```
*Outputs: `data/processed/rfm_raw.csv` and `data/processed/preprocessing_audit.json`*

### Step 4: Train Machine Learning Pipeline
```bash
python ml/train.py
```
*Outputs: Fitted joblib models in `ml/artifacts/` and 6 high-res plots in `reports/figures/`*

### Step 5: Run Academic Evaluation Summary
```bash
python ml/evaluate.py
```

### Step 6: Generate the Academic Case Study PDF
```bash
python reports/generate_report.py
```
*Compiles the formal 7-page PDF to `reports/ShopSense_AI_Case_Study.pdf`*

### Step 7: Run Automated Test Suite
```bash
python -m pytest
```
*Runs all 13 unit and integration tests across data processing, models, and endpoints.*

---

## 8. Starting the Web Application

### Terminal 1: Backend Server (FastAPI)
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### Terminal 2: Frontend Server (React + Vite)
```bash
cd frontend
npm run dev
```
- Frontend UI URL: `http://localhost:5173`

---

## 9. Viva Voce Preparation

For a concise summary of the research methodology, trade-offs, and 5 likely faculty questions with answers, see:
[`reports/VIVA_NOTES.md`](reports/VIVA_NOTES.md).

