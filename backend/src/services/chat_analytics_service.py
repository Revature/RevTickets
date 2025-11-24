from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from collections import Counter
import logging

from src.models.chat_session import KBChatSession, ChatMessage
from src.models.article import Article

logger = logging.getLogger(__name__)


class ChatAnalyticsService:
    """Service for aggregating chat analytics data"""

    @staticmethod
    async def get_analytics(
        user_id: str = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get comprehensive chat analytics
        
        Args:
            user_id: Optional user ID to filter by user (None for all users)
            days: Number of days to look back for time-based metrics
        
        Returns:
            Dictionary containing various analytics metrics
        """
        try:
            # Calculate date range
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=days)
            
            # Build query - Beanie uses Python expressions
            if user_id:
                all_sessions = await KBChatSession.find(
                    KBChatSession.user_id == user_id,
                    KBChatSession.created_at >= start_date
                ).to_list()
            else:
                all_sessions = await KBChatSession.find(
                    KBChatSession.created_at >= start_date
                ).to_list()
            
            # Get all messages for these sessions
            session_ids = [str(session.id) for session in all_sessions]
            if session_ids:
                # Beanie doesn't have .in_() method, so we'll filter in Python
                all_messages_raw = await ChatMessage.find().to_list()
                all_messages = [m for m in all_messages_raw if m.session_id in session_ids]
            else:
                all_messages = []
            
            # Calculate basic metrics
            total_sessions = len(all_sessions)
            total_messages = len(all_messages)
            active_sessions = len([s for s in all_sessions if s.is_active])
            converted_sessions = len([s for s in all_sessions if s.converted_to_ticket])
            
            # Average messages per session
            avg_messages_per_session = (
                total_messages / total_sessions if total_sessions > 0 else 0
            )
            
            # Conversion rate
            conversion_rate = (
                (converted_sessions / total_sessions * 100) if total_sessions > 0 else 0
            )
            
            # Average satisfaction rating
            rated_sessions = [s for s in all_sessions if s.satisfaction_rating]
            avg_satisfaction = (
                sum(s.satisfaction_rating for s in rated_sessions) / len(rated_sessions)
                if rated_sessions else 0
            )
            
            # Most referenced articles
            article_references = []
            for message in all_messages:
                if message.sources:
                    for source in message.sources:
                        if isinstance(source, dict) and "article_id" in source:
                            article_references.append(source["article_id"])
            
            article_counter = Counter(article_references)
            top_articles_data = []
            for article_id, count in article_counter.most_common(10):
                try:
                    article = await Article.get(article_id)
                    if article:
                        top_articles_data.append({
                            "article_id": str(article.id),
                            "title": article.title,
                            "reference_count": count
                        })
                except Exception as e:
                    logger.warning(f"Could not fetch article {article_id}: {e}")
                    continue
            
            # Time-based trends (sessions per day)
            sessions_by_date = {}
            for session in all_sessions:
                date_key = session.created_at.date().isoformat()
                sessions_by_date[date_key] = sessions_by_date.get(date_key, 0) + 1
            
            # Sort dates and create trend data
            sorted_dates = sorted(sessions_by_date.keys())
            sessions_trend = [
                {"date": date, "count": sessions_by_date[date]}
                for date in sorted_dates
            ]
            
            # Messages by type
            user_messages = len([m for m in all_messages if m.message_type == "user"])
            assistant_messages = len([m for m in all_messages if m.message_type == "assistant"])
            
            # Average session duration (time between first and last message)
            session_durations = []
            for session in all_sessions:
                session_messages = [m for m in all_messages if m.session_id == str(session.id)]
                if len(session_messages) > 1:
                    session_messages.sort(key=lambda x: x.timestamp)
                    duration = (session_messages[-1].timestamp - session_messages[0].timestamp).total_seconds()
                    session_durations.append(duration)
            
            avg_session_duration_seconds = (
                sum(session_durations) / len(session_durations)
                if session_durations else 0
            )
            avg_session_duration_minutes = avg_session_duration_seconds / 60
            
            # Top topics (from topics_discussed field)
            all_topics = []
            for session in all_sessions:
                if session.topics_discussed:
                    all_topics.extend(session.topics_discussed)
            
            topic_counter = Counter(all_topics)
            top_topics = [
                {"topic": topic, "count": count}
                for topic, count in topic_counter.most_common(10)
            ]
            
            return {
                "summary": {
                    "total_sessions": total_sessions,
                    "total_messages": total_messages,
                    "active_sessions": active_sessions,
                    "converted_sessions": converted_sessions,
                    "avg_messages_per_session": round(avg_messages_per_session, 2),
                    "conversion_rate": round(conversion_rate, 2),
                    "avg_satisfaction_rating": round(avg_satisfaction, 2),
                    "avg_session_duration_minutes": round(avg_session_duration_minutes, 2),
                    "user_messages": user_messages,
                    "assistant_messages": assistant_messages
                },
                "top_articles": top_articles_data,
                "sessions_trend": sessions_trend,
                "top_topics": top_topics,
                "date_range": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "days": days
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating chat analytics: {e}")
            raise

