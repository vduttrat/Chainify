from langchain_text_splitters import RecursiveCharacterTextSplitter, markdown
from langchain_huggingface import HuggingFaceEmbeddings
import pymupdf4llm
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_qdrant import QdrantVectorStore
import os, glob, re


COLLECTION_NAME = "food"
SIZE = 768 #for BAAI/bge-base-en-v1.5
FILES_PATH = "../docs/food/*.pdf"

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
    model_name="BAAI/bge-base-en-v1.5", #Using the base BGE embedding model
    model_kwargs={"device":"cpu"},
    encode_kwargs={"normalize_embeddings": True},
    query_encode_kwargs={"prompt": "Represent this sentence for searching relevant passages: "}
)

qdrant_db = QdrantVectorStore.from_documents(
    documents=all_final_docs,
    embedding=bge_embeddings,
    url="http://localhost:6333",
    collection_name=COLLECTION_NAME,
    force_recreate = True
)

print("Successfully inserted into Qdrant Vector Database!")
