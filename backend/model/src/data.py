from langchain_text_splitters import RecursiveCharacterTextSplitter, markdown
from langchain_huggingface import HuggingFaceEmbeddings
import pymupdf4llm
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http import models
from tqdm import tqdm
import os, glob, re
from dotenv import load_dotenv
load_dotenv()


COLLECTION_NAME = "food"
SIZE = 768 #for BAAI/bge-base-en-v1.5
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FILES_PATH = os.path.join(SCRIPT_DIR, "..", "docs", "food", "*.pdf")

headers_to_split_on = [
    ("#", "Chapter"),
    ("##", "Regulation")
]
md_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)

recursive_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,
    chunk_overlap=150,
    separators=["\n\n", "\n", ".", " ", ""]
)

all_final_docs = []
pdf_files = glob.glob(FILES_PATH)
print(f"Found {len(pdf_files)}. Starting processing... ")

for file_path in pdf_files:
    file_name = os.path.basename(file_path)
    print(f"Processing {file_path}")
    
    md_txt = pymupdf4llm.to_markdown(file_path)
    md_txt = re.sub(r'--- PAGE \d+ ---', '', md_txt)
    md_txt = re.sub(r'(?i)Version\s*-\s*[IVXLCDM\d]+\s*\([\d\.]+\)', '', md_txt)
    md_txt = re.sub(r'(?m)^(CHAPTER\s+[IVXLCDM\d]+)', r'# \1', md_txt)
    md_txt = re.sub(r'(?m)^(\d+\.\s?[A-Z])', r'## \1', md_txt)
    docs = md_splitter.split_text(md_txt)

    for doc in docs:
        doc.metadata['source_file'] = file_name
        doc.metadata['domain'] = 'food_regulation'
        
    chunked_docs = recursive_splitter.split_documents(docs)
    all_final_docs.extend(chunked_docs)

print(f"Processing complete, processed {len(all_final_docs)}")


bge_embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-base-en-v1.5", 
    model_kwargs={"device":"cpu"},
    encode_kwargs={"normalize_embeddings": True},
    query_encode_kwargs={"prompt": "Represent this sentence for searching relevant passages: "}
)

print(f"Starting the heavy CPU embedding process for {len(all_final_docs)} chunks...")

# 1. FAIL FAST: Initialize the raw client first to ensure your API keys are correct 
# before making the CPU do 15 minutes of math.
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)

# 2. Recreate the collection manually so we start fresh
client.recreate_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
)

# 3. Initialize the LangChain wrapper around the existing client
qdrant_db = QdrantVectorStore(
    client=client,
    collection_name=COLLECTION_NAME,
    embedding=bge_embeddings
)

# 4. BATCH UPLOAD: Process and upload 50 chunks at a time with a progress bar!
batch_size = 50
for i in tqdm(range(0, len(all_final_docs), batch_size), desc="Embedding & Uploading"):
    batch = all_final_docs[i:i + batch_size]
    # This will embed the 50 chunks and immediately upload them to the cloud
    qdrant_db.add_documents(batch)

print("Successfully inserted all batches into Qdrant Cloud!")
