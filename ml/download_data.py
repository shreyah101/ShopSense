"""
ShopSense - Dataset Downloader
Official UCI Online Retail Dataset (Dataset ID 352)
Source: https://archive.ics.uci.edu/dataset/352/online+retail
"""

import os
import sys
import zipfile
import requests
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
DATA_FILE = DATA_DIR / "Online Retail.xlsx"
UCI_ZIP_URL = "https://archive.ics.uci.edu/static/public/352/online+retail.zip"
ALT_XLSX_URL = "https://raw.githubusercontent.com/datasets/online-retail/master/data/online_retail.xlsx"

def check_or_download_dataset() -> bool:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if DATA_FILE.exists() and DATA_FILE.stat().st_size > 1_000_000:
        print(f"[OK] Dataset already present at: {DATA_FILE}")
        print(f"     File size: {DATA_FILE.stat().st_size / (1024*1024):.2f} MB")
        return True

    print(f"Downloading UCI Online Retail Dataset from {UCI_ZIP_URL}...")
    zip_path = DATA_DIR / "online_retail.zip"
    try:
        response = requests.get(UCI_ZIP_URL, stream=True, timeout=60)
        response.raise_for_status()
        with open(zip_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)
        print(f"Downloaded ZIP ({zip_path.stat().st_size / (1024*1024):.2f} MB). Extracting...")

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(DATA_DIR)
        
        if zip_path.exists():
            zip_path.unlink()

        if DATA_FILE.exists():
            print(f"[SUCCESS] Dataset extracted to {DATA_FILE}")
            return True
        else:
            # Check for case variations
            for f in DATA_DIR.glob("*.xlsx"):
                if "retail" in f.name.lower():
                    f.rename(DATA_FILE)
                    print(f"[SUCCESS] Renamed {f.name} to {DATA_FILE.name}")
                    return True
            raise FileNotFoundError("Extracted archive did not contain Online Retail.xlsx")
    except Exception as e:
        print(f"[WARNING] Automatic download from UCI encountered: {e}")
        print(f"Please ensure 'Online Retail.xlsx' is placed manually in: {DATA_DIR}")
        return False

if __name__ == "__main__":
    success = check_or_download_dataset()
    if not success:
        sys.exit(1)

