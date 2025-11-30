from fastapi import APIRouter, HTTPException
from app.schemas.autocomplete import AutocompleteRequest, AutocompleteResponse
from app.services.autocomplete_service import AutocompleteService

router = APIRouter()


@router.post("/autocomplete", response_model=AutocompleteResponse)
async def get_autocomplete_suggestion(request: AutocompleteRequest):
    """Get AI-style autocomplete suggestion (mocked)"""
    try:
        suggestion = AutocompleteService.get_autocomplete_suggestion(request)
        return suggestion
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestion: {str(e)}")