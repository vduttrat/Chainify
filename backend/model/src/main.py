from typing import Dict
from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_classic.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders.huggingface import HuggingFaceCrossEncoder
from langchain_groq import ChatGroq
from src import state


bge_embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-base-en-v1.5", #Using the base BGE embedding model
    model_kwargs={"device":"cpu"},
    encode_kwargs={"normalize_embeddings": True},
    query_encode_kwargs={"prompt": "Represent this sentence for searching relevant passages: "}
)

COLLECTION_NAME = "food"
MODEL="llama-3.3-70b-versatile"
CROSS_ENCODER = "BAAI/bge-reranker-base"
vectorstore = QdrantVectorStore.from_existing_collection(
    collection_name=COLLECTION_NAME,
    embedding=bge_embeddings,
    url="http://localhost:6333"
)

base_retriever = vectorstore.as_retriever(search_kwargs={"k":20})
cross_encoder = HuggingFaceCrossEncoder(model_name=CROSS_ENCODER)
compressor = CrossEncoderReranker(model=cross_encoder, top_n=5)
retriever = ContextualCompressionRetriever(
    base_compressor=compressor, 
    base_retriever=base_retriever
)
print(f"retriever init!")

llm = ChatGroq(model=MODEL, temperature=0)

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

def retrieval(state : state.GraphState) -> Dict:
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

def eval(graph_state: state.GraphState) -> Dict:
    context_str = "\n\n".join(graph_state.retrieved_regulations)
    
    prompt = f"""
    You are a strict, ruthless legal compliance auditor. 
    
    EVENT DESCRIPTION:
    {graph_state.request.event_description}
    
    RETRIEVED FSSAI LAW (YOUR ONLY SOURCE OF TRUTH):
    {context_str}
    
    CRITICAL INSTRUCTIONS:
    1. In your `analysis_scratchpad`, you MUST explicitly quote the retrieved law regarding contaminant percentages.
    2. Read to the very end of every legal sentence. Pay attention to "shall not".
    3. If the event contradicts the quote, set is_law_flagged = True.
    4. Ignore irrelevant tables (like beverage standards) if they do not apply to the specific product or its organic status.
    """
    
    structured_llm = llm.with_structured_output(state.EvaluationResult)
    response = structured_llm.invoke([{"role": "user", "content": prompt}])
    return {"evaluation": response}

workflow = StateGraph(state.GraphState)
workflow.add_node(translate_to_legalese)
workflow.add_node(retrieval)
workflow.add_node(eval)
workflow.add_edge(START, "translate_to_legalese")
workflow.add_edge("translate_to_legalese", "retrieval")
workflow.add_edge("retrieval", "eval")
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
