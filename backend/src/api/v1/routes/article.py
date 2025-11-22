from fastapi import APIRouter, HTTPException, Depends
from src.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse
from beanie import PydanticObjectId
from src.services.article_service import ArticleService
from typing import List
from src.utils.security import get_current_agent_user, get_current_user

router = APIRouter(prefix="/articles", tags=["Articles"])

# Agent-only routes (create, update, delete)
@router.post("/", response_model=ArticleResponse, dependencies=[Depends(get_current_agent_user)])
async def create_article(data: ArticleCreate):
    try:
        return await ArticleService.create_article(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{article_id}", response_model=ArticleResponse, dependencies=[Depends(get_current_agent_user)])
async def update_article(article_id: str, data: ArticleUpdate):
    try:
        return await ArticleService.update_article(article_id, data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{article_id}", dependencies=[Depends(get_current_agent_user)])
async def delete_article(article_id: str):
    await ArticleService.delete_article(article_id)
    return {"message": "Article deleted"}

# Public routes (all authenticated users can browse)
@router.get("/", response_model=List[ArticleResponse], dependencies=[Depends(get_current_user)])
async def get_all_articles():
    return await ArticleService.get_all_articles()

@router.get("/search", response_model=List[ArticleResponse], dependencies=[Depends(get_current_user)])
async def search_articles(
    q: str,
    categoryId: str = None,
    subcategoryId: str = None
):
    """
    Search articles by title with optional category/subcategory filters
    """
    return await ArticleService.search_articles(q, categoryId, subcategoryId)

@router.get("/category/{category_id}", response_model=List[ArticleResponse], dependencies=[Depends(get_current_user)])
async def get_articles_by_category(category_id: str):
    return await ArticleService.get_articles_by_category(category_id)

@router.get("/subcategory/{subcategory_id}", response_model=List[ArticleResponse], dependencies=[Depends(get_current_user)])
async def get_articles_by_subcategory(subcategory_id: str):
    return await ArticleService.get_articles_by_subcategory(subcategory_id)

@router.get("/{article_id}", response_model=ArticleResponse, dependencies=[Depends(get_current_user)])
async def get_article(article_id: str):
    try:
        return await ArticleService.get_article(article_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))