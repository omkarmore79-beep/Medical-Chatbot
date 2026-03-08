import os
import pandas as pd

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document


# ==============================
# 1) Data Folder
# ==============================

KB_DIR = "knowledge_base"

SYMPTOM_FILE = os.path.join(KB_DIR, "symptom_kb.csv")
DRUG_FILE = os.path.join(KB_DIR, "Comprehensive_Medicine_Database.xlsx")
MEDQA_FILE = os.path.join(KB_DIR, "medquad.csv")
INDIAN_MEDICINE_FILE = os.path.join(KB_DIR, "updated_indian_medicine_data.csv")
BRAND_INDEX_XLSX = os.path.join(KB_DIR, "Comprehensive_Medicine_Brand_Index.xlsx")
BRAND_INDEX_CSV = os.path.join(KB_DIR, "Comprehensive_Medicine_Brand_Index.csv")


# ==============================
# 2) Output Vectorstore Folders
# ==============================

VS_SYMPTOMS = "vectorstore_symptoms"
VS_DRUGS = "vectorstore_drugs"
VS_MEDQA = "vectorstore_medqa"
VS_INDIAN_MEDICINE = "vectorstore_indian_medicine"


# ==============================
# 3) Embedding Model
# ==============================

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    encode_kwargs={"normalize_embeddings": True},
)


# ==============================
# 4) Structured Row Builder
# ==============================


def row_to_structured_text(row: pd.Series) -> str:
    parts = []
    for col in row.index:
        value = str(row[col]).strip()
        if value and value.lower() != "nan":
            parts.append(f"{col}: {value}")
    return "\n".join(parts)


def _read_csv_with_fallback(path: str) -> pd.DataFrame:
    try:
        return pd.read_csv(path, encoding="utf-8")
    except UnicodeDecodeError:
        return pd.read_csv(path, encoding="latin-1")


def build_vectorstore_from_dataframe(df: pd.DataFrame, out_dir: str, domain: str):
    df = df.fillna("")
    docs = []

    for i, row in df.iterrows():
        docs.append(
            Document(
                page_content=row_to_structured_text(row),
                metadata={
                    "domain": domain,
                    "row_id": int(i),
                },
            )
        )

    if not docs:
        print(f"WARN: No rows for {out_dir}. Skipping save.")
        return

    db = FAISS.from_documents(docs, embeddings)
    db.save_local(out_dir)
    print(f"OK: Saved {out_dir} | Docs: {len(docs)}")


# ==============================
# 5) Brand Index Loader / Builder
# ==============================


def load_brand_index_df() -> pd.DataFrame:
    """
    Load brand index from xlsx (preferred) or csv (fallback).
    Returns empty DataFrame if no source is available.
    """
    if os.path.exists(BRAND_INDEX_XLSX):
        return pd.read_excel(BRAND_INDEX_XLSX)

    if os.path.exists(BRAND_INDEX_CSV):
        return _read_csv_with_fallback(BRAND_INDEX_CSV)

    print(f"WARN: Brand index not found: {BRAND_INDEX_XLSX} or {BRAND_INDEX_CSV}")
    return pd.DataFrame()


def build_brand_index_documents(df: pd.DataFrame):
    """
    Convert brand index rows into structured searchable documents.
    Required columns: brand, generic, aliases, form, strength.
    """
    if df.empty:
        return []

    df.columns = [str(c).strip().lower() for c in df.columns]
    required = ["brand", "generic", "aliases", "form", "strength"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        print(f"WARN: Brand index missing columns: {missing}")
        return []

    df = df.fillna("")
    docs = []

    for i, row in df.iterrows():
        brand = str(row["brand"]).strip()
        generic = str(row["generic"]).strip()
        aliases = str(row["aliases"]).strip()
        form = str(row["form"]).strip()
        strength = str(row["strength"]).strip()

        if not brand or not generic:
            continue

        content = (
            f"Brand: {brand}\n"
            f"Generic: {generic}\n"
            f"Aliases: {aliases}\n"
            f"Form: {form}\n"
            f"Strength: {strength}"
        )

        docs.append(
            Document(
                page_content=content,
                metadata={
                    "domain": "indian_medicine",
                    "source": "brand_index",
                    "row_id": int(i),
                    "brand": brand,
                    "generic": generic,
                    "form": form,
                },
            )
        )

    return docs


def build_indian_medicine_vectorstore_with_brand_index():
    """
    Build VS_INDIAN_MEDICINE by combining:
    1) Existing Indian medicine dataset
    2) Brand index dataset (if available)
    """
    docs = []

    if os.path.exists(INDIAN_MEDICINE_FILE):
        try:
            df_ind = _read_csv_with_fallback(INDIAN_MEDICINE_FILE).fillna("")
            for i, row in df_ind.iterrows():
                docs.append(
                    Document(
                        page_content=row_to_structured_text(row),
                        metadata={
                            "domain": "indian_medicine",
                            "source": "updated_indian_medicine_data",
                            "row_id": int(i),
                        },
                    )
                )
        except Exception as e:
            print(f"WARN: Failed to load Indian medicine file: {e}")
    else:
        print(f"WARN: Indian medicine file not found: {INDIAN_MEDICINE_FILE}")

    try:
        df_brand = load_brand_index_df()
        brand_docs = build_brand_index_documents(df_brand)
        docs.extend(brand_docs)
        if brand_docs:
            print(f"OK: Brand index docs added: {len(brand_docs)}")
    except Exception as e:
        print(f"WARN: Failed to process brand index: {e}")

    if not docs:
        print("WARN: No documents available for VS_INDIAN_MEDICINE. Skipping save.")
        return

    db = FAISS.from_documents(docs, embeddings)
    db.save_local(VS_INDIAN_MEDICINE)
    print(f"OK: Saved {VS_INDIAN_MEDICINE} | Docs: {len(docs)}")


# ==============================
# 6) Main Builder
# ==============================


def main():
    # 1) Symptoms
    if os.path.exists(SYMPTOM_FILE):
        df_sym = _read_csv_with_fallback(SYMPTOM_FILE)
        build_vectorstore_from_dataframe(df_sym, VS_SYMPTOMS, "symptoms")
    else:
        print(f"WARN: Missing {SYMPTOM_FILE}")

    # 2) Drugs
    if os.path.exists(DRUG_FILE):
        df_drug = pd.read_excel(DRUG_FILE)
        build_vectorstore_from_dataframe(df_drug, VS_DRUGS, "drugs")
    else:
        print(f"WARN: Missing {DRUG_FILE}")

    # 3) MedQA
    if os.path.exists(MEDQA_FILE):
        df_medqa = _read_csv_with_fallback(MEDQA_FILE)
        build_vectorstore_from_dataframe(df_medqa, VS_MEDQA, "medqa")
    else:
        print(f"WARN: Missing {MEDQA_FILE}")

    # 4) Indian Medicine + Brand Index
    build_indian_medicine_vectorstore_with_brand_index()

    print("DONE: All vectorstores created successfully!")


if __name__ == "__main__":
    main()