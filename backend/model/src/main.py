from typing import Dict
from src import state
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_classic.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_groq import ChatGroq
from langchain_community.utilities import SerpAPIWrapper
from langchain_cohere import CohereRerank
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
load_dotenv()

app = FastAPI()
origins = [
    '*'
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods='*',
    allow_headers='*'
)

bge_embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-base-en-v1.5", #Using the base BGE embedding model
    model_kwargs={"device":"cpu"},
    encode_kwargs={"normalize_embeddings": True},
    query_encode_kwargs={"prompt": "Represent this sentence for searching relevant passages: "}
)

COLLECTION_NAME = "food"
MODEL="llama-3.3-70b-versatile"
vectorstore = QdrantVectorStore.from_existing_collection(
    collection_name=COLLECTION_NAME,
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    embedding=bge_embeddings
)

base_retriever = vectorstore.as_retriever(search_kwargs={"k":20})
cohere_rerank = CohereRerank(
    model="rerank-english-v3.0", 
    top_n=3
)
retriever = ContextualCompressionRetriever(
    base_compressor=cohere_rerank,
    base_retriever=base_retriever
)
print(f"retriever init!")

llm = ChatGroq(model=MODEL, temperature=0)
search = SerpAPIWrapper()

def translate_to_legalese(state: state.GraphState) -> Dict:
    """
    Convert the input into a strict, keyword-only search query for the vector DB.
    """
    sys_msg = SystemMessage(
        content=(
            "You are a strict data extraction tool. Convert the supply chain event "
            "into a dense, comma-separated list of legal search keywords.\n\n"
            "CRITICAL RULES:\n"
            "- EXTRACT ONLY: product names, certification labels, and specific numerical metrics.\n"
            "- ADDITIONALLY: Always deduce and append the broader regulatory domain (e.g., 'organic food', 'packaging', 'contaminants', 'additives').\n"
            "- EXAMPLE INPUT: Batch of packaged milk received at 15C with a broken seal.\n"
            "- EXAMPLE OUTPUT: packaged milk, temperature storage, 15C, broken seal, packaging integrity, dairy regulations\n"
        )
    )
    human_msg = HumanMessage(content=state.request.event_description)
    response = llm.invoke([sys_msg, human_msg])
    return {"legal_search_query": response.content}

def translate_to_webese(state: state.GraphState) -> Dict:
    """Creates a targeted Google search query to find specific law violations."""
    prompt = f"""
    Based on this supply chain event: {state.request.event_description}
    Write a single, highly specific Google search query to find news, FSSAI penalty reports, 
    or legal precedents regarding this potential violation. 
    Output ONLY the search query string.
    """
    response = llm.invoke([{"role": "user", "content": prompt}])
    return {"web_search_query": response.content.strip()}

def pdf_retrieval(state : state.GraphState) -> Dict:
    """
    Search and retrieve info about different food regulation laws related to the query.
    """
    docs = retriever.invoke(state.legal_search_query)
    formatted_docs = []
    for doc in docs:
        meta = doc.metadata
        header_info = f"[{meta.get('Chapter','')} {meta.get('Regulation','')} {meta.get('source_file','')}]"
        formatted_docs.append(f"{header_info}\n{doc.page_content}")
    return {"retrieved_regulations" : formatted_docs}

def web_retrieval(state: state.GraphState) -> Dict:
    """Executes the SerpAPI search and formats the top snippets."""
    print(f"--- Searching web for: {state.web_search_query} --- ")
    raw_results = search.run(state.web_search_query)
    formatted_results = f"WEB SEARCH RESULTS:\n{raw_results}"
    return {"web_results" : formatted_results}

def eval(graph_state: state.GraphState) -> Dict:
    context_str = "\n\n".join(graph_state.retrieved_regulations)
    web_str = graph_state.web_results
    
    prompt = f"""
    You are a strict, ruthless legal compliance auditor. 
    
    EVENT DESCRIPTION:
    {graph_state.request.event_description}
    
    RETRIEVED FSSAI LAW (YOUR ONLY SOURCE OF TRUTH):
    {context_str}

    REAL-WORLD WEB PRECEDENTS:
    {web_str}
    
    CRITICAL INSTRUCTIONS:
    1. In your `analysis_scratchpad`, you MUST explicitly quote the retrieved FSSAI law first. 
    2. Next, summarize any relevant penalties or precedents found in the WEB PRECEDENTS.
    3. Read to the very end of every legal sentence. Pay attention to "shall not".
    4. If the event contradicts the official FSSAI quote, set is_law_flagged = True. Use the web precedents to help inform your fraud_probability_score.
    5. Ignore irrelevant tables (like beverage standards) if they do not apply to the specific product or its organic status.
    """
    
    structured_llm = llm.with_structured_output(state.EvaluationResult)
    response = structured_llm.invoke([{"role": "user", "content": prompt}])
    return {"evaluation": response}

workflow = StateGraph(state.GraphState)

workflow.add_node(translate_to_legalese)
workflow.add_node(pdf_retrieval)
workflow.add_node(eval)
workflow.add_node(translate_to_webese)
workflow.add_node(web_retrieval)

workflow.add_edge(START, "translate_to_legalese")
workflow.add_edge(START, "translate_to_webese")

workflow.add_edge("translate_to_legalese", "pdf_retrieval")
workflow.add_edge("translate_to_webese", "web_retrieval")

workflow.add_edge("pdf_retrieval", "eval")
workflow.add_edge("web_retrieval", "eval")
workflow.add_edge("eval", END)

graph = workflow.compile()
graph.get_graph().draw_mermaid_png()

def contact_llm(msg: str):
    initial_request = state.AnalyzeRequest(
        event_description=msg
    )
    initial_state = {"request" : initial_request}
    final_evaluation = None
    for chunk in graph.stream(initial_state):
        for node_name, update in chunk.items():
            print(f"--- Completed Node: {node_name} ---")
            if node_name == "eval":
                final_evaluation = update["evaluation"]
                
    return final_evaluation

@app.get("/flag")
def conn_mod(msg: str):
    return contact_llm(msg)
