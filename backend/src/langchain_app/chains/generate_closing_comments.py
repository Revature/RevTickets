from src.langchain_app.config.model_config import get_llm
from langchain_core.output_parsers import JsonOutputParser
from src.schemas.closing_comments import ClosingComments

import json
import asyncio

parser = JsonOutputParser(pydantic_object=ClosingComments)

async def generate_closing_comments(ticket_data: dict) -> str:
    llm = get_llm()
    if llm is None:
        # Return default closing comments when LLM is not available
        return {
            "reason": "AI service unavailable",
            "comment": "Ticket closed. AI-generated closing comments require a valid Google API key."
        }
    
    content = (
        f"Ticket Title: {ticket_data['title']}\n"
        f"Description: {ticket_data['description']}\n"
        f"Category: {ticket_data['category']}\n"
        f"Subcategory: {ticket_data['subcategory']}\n"
        f"Tags: {', '.join(ticket_data['tags'])}\n"
        f"Comments:\n" + "\n".join(ticket_data["comments"])
    )

    messages = [
        {"role": "system", "content": """You are a helpful assistant that generates closing comments for the agent based on the ticket information. 
         output in json:
         {"reason": "", "comment": ""}

         """},
        {"role": "user", "content": f"Please summarize the following ticket:\n{content}"}
    ]

    try:
        chain = llm | parser
        # Add 20-second timeout for API call - fallback if timeout
        try:
            # Create a task that can be cancelled
            task = asyncio.create_task(chain.ainvoke(messages))
            try:
                response = await asyncio.wait_for(task, timeout=20.0)
                return response
            except asyncio.TimeoutError:
                # Cancel the task if it's still running
                if not task.done():
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
                raise  # Re-raise to handle in outer except block
        except asyncio.TimeoutError:
            print("AI closing comments generation timed out after 20 seconds - using fallback")
            return {
                "reason": "AI service timeout",
                "comment": "Ticket closed. AI service did not respond within 20 seconds."
            }
    except Exception as e:
        print(f"AI closing comments generation failed: {e}")
        return {
            "reason": "AI service error",
            "comment": f"Ticket closed. Error generating AI comments: {str(e)}"
        }