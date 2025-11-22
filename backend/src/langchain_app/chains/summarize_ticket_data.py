from src.langchain_app.config.model_config import get_llm
import asyncio

async def summarize_ticket_data(ticket_data: dict) -> str:
    content = (
        f"Ticket Title: {ticket_data['title']}\n"
        f"Description: {ticket_data['description']}\n"
        f"Category: {ticket_data['category']}\n"
        f"Subcategory: {ticket_data['subcategory']}\n"
        f"Tags: {', '.join(ticket_data['tags'])}\n"
        f"Comments:\n" + "\n".join(ticket_data["comments"])
    )

    llm = get_llm()
    if llm is None:
        # Fallback to simple text-based summary when LLM is not available
        comment_count = len(ticket_data["comments"])
        tags_text = ", ".join(ticket_data['tags']) if ticket_data['tags'] else "None"
        
        fallback_summary = f"""**Ticket Summary (AI unavailable - using fallback)**

**Issue:** {ticket_data['title']}
**Category:** {ticket_data['category']} → {ticket_data['subcategory']}
**Tags:** {tags_text}
**Description:** {ticket_data['description'][:200]}{'...' if len(ticket_data['description']) > 200 else ''}
**Comments:** {comment_count} comment{'s' if comment_count != 1 else ''}

*Note: This is a basic summary. Full AI summarization requires valid Google API key.*"""
        
        return fallback_summary

    try:
        messages = [
            {"role": "system", "content": """You are a helpful assistant that summarizes ticket information. 
             Please provide a concise summary of the ticket including the main issue, any relevant details, and current status.
             """},
            {"role": "user", "content": f"Please summarize the following ticket:\n{content}"}
        ]

        # Add 20-second timeout for API call - fallback to text summary if timeout
        try:
            response = await asyncio.wait_for(
                llm.ainvoke(messages),
                timeout=20.0
            )
            return response.content.strip()
        except asyncio.TimeoutError:
            print("AI summarization timed out after 20 seconds - using fallback summary")
            # Fallback to simple text-based summary when API times out
            comment_count = len(ticket_data["comments"])
            tags_text = ", ".join(ticket_data['tags']) if ticket_data['tags'] else "None"
            
            fallback_summary = f"""**Ticket Summary (AI timeout - using fallback)**

**Issue:** {ticket_data['title']}
**Category:** {ticket_data['category']} → {ticket_data['subcategory']}
**Tags:** {tags_text}
**Description:** {ticket_data['description'][:200]}{'...' if len(ticket_data['description']) > 200 else ''}
**Comments:** {comment_count} comment{'s' if comment_count != 1 else ''}

*Note: This is a basic summary. AI service did not respond within 20 seconds.*"""
            
            return fallback_summary
    except Exception as e:
        print(f"AI summarization failed: {e}")
        # Fallback to simple text-based summary for development
        comment_count = len(ticket_data["comments"])
        tags_text = ", ".join(ticket_data['tags']) if ticket_data['tags'] else "None"
        
        fallback_summary = f"""**Ticket Summary (AI unavailable - using fallback)**

**Issue:** {ticket_data['title']}
**Category:** {ticket_data['category']} → {ticket_data['subcategory']}
**Tags:** {tags_text}
**Description:** {ticket_data['description'][:200]}{'...' if len(ticket_data['description']) > 200 else ''}
**Comments:** {comment_count} comment{'s' if comment_count != 1 else ''}

*Note: This is a basic summary. Full AI summarization requires valid Google API key.*"""
        
        return fallback_summary
