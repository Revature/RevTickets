# ENHANCEMENT L3: KB CHAT - LangChain chain for knowledge base chat with RAG

from typing import List, Dict, Any, Tuple
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from src.langchain_app.config.model_config import chat_model
import logging
from src.langchain_app.config.chroma_config import get_chroma_client
from src.langchain_app.config.model_config import embedding_model



logger = logging.getLogger(__name__)

COLLECTION_NAME = "articles_collection"


class KBChatChain:
    """LangChain chain for knowledge base chat with RAG capabilities"""

    def __init__(self):
        self.chat_model = chat_model
        self._setup_prompt_template()
        client = get_chroma_client()
        self.collection = client.get_or_create_collection(
            name=COLLECTION_NAME
        )
        self.embeddings = embedding_model


    def _setup_prompt_template(self):
        """Setup the prompt template for RAG responses"""

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful knowledge base assistant for a customer support system.

Use the provided knowledge base articles to answer user questions.
- Be concise but clear
- If the KB does not contain relevant info, say so honestly
- Suggest creating a support ticket if needed
- Maintain a professional tone
- Consider conversation history

Knowledge Base Articles:
{context}

Conversation History:
{history}
"""),
            ("human", "User Question: {question}")
        ])

        # Attach parser directly
        self.chain = self.prompt | self.chat_model | StrOutputParser()

    async def generate_response(
        self,
        question: str,
        history: List[Dict[str, str]]
    ) -> tuple[str, List[Dict[str, str]]]:
        """Generate AI response using RAG with provided contexts"""
        try:
            context_text, sources = self._format_contexts(question)
            history_text = self._format_history(history)

            try:
                response = await self.chain.ainvoke({
                    "context": context_text,
                    "history": history_text,
                    "question": question
                })
            except Exception as llm_error:
                logger.error(f"Failed to invoke LLM chain: {llm_error}")
                # Return a fallback response if LLM fails
                error_msg = str(llm_error).lower()
                if "connection" in error_msg or "api" in error_msg or "timeout" in error_msg:
                    fallback_response = (
                        "I'm having trouble connecting to the AI service right now. "
                        "This could be due to network issues or API configuration. "
                        "Please try again in a moment."
                    )
                    return fallback_response, sources
                # For other errors, still return a response but log the error
                fallback_response = (
                    "I encountered an error while processing your question. "
                    "Please try rephrasing it or try again later."
                )
                return fallback_response, sources

            return response, sources
        except Exception as e:
            logger.error(f"Failed to generate KB chat response: {e}")
            # Return fallback instead of raising to prevent complete failure
            fallback_msg = (
                "I'm having trouble processing your question right now. "
                "Please try rephrasing your question or try again later."
            )
            return fallback_msg, []

    def _format_contexts(self, question: str, top_k: int = 5) -> (str, List[Dict[str, str]]):
        """Retrieve top-k relevant articles and return both text and structured sources."""
        try:
            # Generate query embedding
            try:
                query_embedding = self.embeddings.embed_query(question)
            except Exception as embed_error:
                logger.error(f"Failed to generate embedding: {embed_error}")
                # Return empty context if embedding fails
                return "No relevant articles found.", []
            
            # Query ChromaDB
            try:
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=top_k
                )
            except Exception as chroma_error:
                logger.error(f"Failed to query ChromaDB: {chroma_error}")
                # Return empty context if ChromaDB query fails
                return "No relevant articles found.", []

            # Check if we have results
            if not results or not results.get("documents") or len(results["documents"][0]) == 0:
                return "No relevant articles found.", []

            contexts = []
            sources = []
            
            for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
                title = meta.get("title", "Untitled")
                article_id = meta.get("article_id", "")
                
                contexts.append(f"{title}: {doc}")
                sources.append({
                    "title": title,
                    "article_id": article_id,
                    "excerpt": doc[:200] + "..." if len(doc) > 200 else doc,
                    "relevance": 0.8,  # Default relevance score
                    "url": f"/knowledge-base/{article_id}" if article_id else "#"
                })

            return "\n\n".join(contexts), sources
        except Exception as e:
            logger.error(f"Failed to retrieve contexts from Chroma: {e}")
            # Return empty context instead of raising to allow chat to continue
            return "No relevant articles found.", []

            
    def _format_history(self, history: List[Dict[str, str]]) -> str:
        """Format conversation history for context"""
        if not history:
            return "No previous conversation."

        formatted = []
        for msg in history[-6:]:  # keep last 6 turns
            role = "User" if msg['role'] == 'user' else "Assistant"
            formatted.append(f"{role}: {msg['content']}")
        return "\n".join(formatted)