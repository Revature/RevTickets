from typing import Dict, Any, List
from datetime import datetime, timezone
import logging

from src.models.chat_session import KBChatSession, ChatMessage
from src.langchain_app.chains.kb_chat import KBChatChain
from src.services.ticket_service import TicketService
from src.schemas.ticket import TicketCreate

logger = logging.getLogger(__name__)


class KBChatService:
    """Service layer for handling knowledge base chat sessions."""

    @staticmethod
    async def get_session(session_id: str) -> KBChatSession:
        """Retrieve a chat session by ID."""
        return await KBChatSession.get(session_id)

    @staticmethod
    async def get_user_sessions(user_id: str, limit: int = 20) -> List[KBChatSession]:
        """Retrieve all sessions for a given user."""
        sessions = await KBChatSession.find(KBChatSession.user_id == user_id).sort("-updated_at").limit(limit).to_list()
        return sessions

    @staticmethod
    async def create_chat_session(user_id: str, initial_message: str = None) -> KBChatSession:
        """Create a new chat session for a user."""
        session = KBChatSession(user_id=user_id)
        await session.insert()

        if initial_message:
            # Save the first user message
            await session.add_message(message=initial_message, message_type="user")
        return session

    @staticmethod
    async def _get_chat_history(session: KBChatSession) -> List[Dict[str, str]]:
        """Return messages as list of dicts for chain consumption"""
        messages = await session.get_messages(limit=100)
        history = []
        for m in messages:
            history.append({
            "role": m.message_type,  # user, assistant, system
            "content": m.message
        })
        return history


    @staticmethod
    async def process_message(session_id: str, user_message: str) -> Dict[str, Any]:
        """Process a user message and generate AI response."""
        session = await KBChatService.get_session(session_id)
        if not session:
            raise ValueError("Chat session not found")

        # Save user message
        await session.add_message(message=user_message, message_type="user")

        try:
            chat_history = await KBChatService._get_chat_history(session)

            chain = KBChatChain()
            ai_response, sources = await chain.generate_response(user_message, chat_history)

            # Save AI response with sources
            await session.add_message(message=ai_response, message_type="assistant", sources=sources)

            return {
                "response": ai_response,
                "sources": sources,
                "session_id": str(session.id),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        except Exception as e:
            logger.error(f"Error processing message in session {session_id}: {e}")
            fallback = "I’m having trouble processing your request right now. Please try again later."
            await session.add_message(message=fallback, message_type="assistant")

            return {
                "response": fallback,
                "sources": [],
                "session_id": str(session.id),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error": str(e)
            }

    @staticmethod
    async def rate_session(session_id: str, rating: int) -> bool:
        session = await KBChatService.get_session(session_id)
        if not session:
            return False
        session.satisfaction_rating = rating  # Store in satisfaction_rating field
        session.rating = rating  # Also update rating for backward compatibility
        await session.save()
        return True

    @staticmethod
    async def convert_to_ticket(session_id: str, ticket_data: Dict[str, Any], current_user) -> str:
        """Convert a chat session to a support ticket, including chat history in description"""
        from src.models.rich_text import create_rich_text_from_text
        
        session = await KBChatService.get_session(session_id)
        if not session:
            raise ValueError("Chat session not found")
        
        # Get chat history to include in ticket description
        chat_messages = await session.get_messages(limit=100)
        
        # Build chat history summary for ticket description
        chat_history_text = "\n\n--- Chat History ---\n"
        for msg in reversed(chat_messages):  # Reverse to show chronological order
            role = "User" if msg.message_type == "user" else "Assistant"
            timestamp = msg.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            chat_history_text += f"\n[{timestamp}] {role}: {msg.message}\n"
        
        # Append chat history to ticket description
        enhanced_description = ticket_data.get("description", "")
        if chat_history_text.strip():
            enhanced_description = f"{enhanced_description}\n{chat_history_text}" if enhanced_description else chat_history_text.strip()
        
        # Create RichTextContent from description
        rich_text_content = create_rich_text_from_text(enhanced_description)
        
        # Get default category/subcategory if not provided
        category_id = ticket_data.get("category_id")
        subcategory_id = ticket_data.get("subcategory_id")
        
        if not category_id or not subcategory_id:
            # Get first available category and subcategory as defaults
            from src.models.category import Category
            from src.models.subcategory import SubCategory
            
            if not category_id:
                first_category = await Category.find().limit(1).to_list()
                if first_category:
                    category_id = str(first_category[0].id)
            
            if not subcategory_id and category_id:
                first_subcategory = await SubCategory.find(
                    SubCategory.category == category_id
                ).limit(1).to_list()
                if first_subcategory:
                    subcategory_id = str(first_subcategory[0].id)
                else:
                    # Fallback: get any subcategory
                    any_subcategory = await SubCategory.find().limit(1).to_list()
                    if any_subcategory:
                        subcategory_id = str(any_subcategory[0].id)
        
        if not category_id or not subcategory_id:
            raise ValueError("Category and subcategory are required. Please ensure categories exist in the system.")
        
        # Create ticket with enhanced description
        ticket_create = TicketCreate(
            category_id=category_id,
            sub_category_id=subcategory_id,
            title=ticket_data.get("title", "Support Request from Chat"),
            description=enhanced_description,
            content=rich_text_content,
            priority=ticket_data.get("priority", "medium"),
            tag_ids=ticket_data.get("tag_ids", [])
        )
        
        # Create ticket using TicketService
        created_ticket = await TicketService.create_ticket(ticket_create, current_user)
        
        # Mark session as converted and link to ticket
        await session.mark_converted_to_ticket(str(created_ticket.id))
        
        return str(created_ticket.id)

    @staticmethod
    async def delete_session(session_id: str) -> bool:
        session = await KBChatService.get_session(session_id)
        if not session:
            return False
        await session.delete()
        return True
