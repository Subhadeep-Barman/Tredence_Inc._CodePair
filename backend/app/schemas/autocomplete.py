from pydantic import BaseModel
from typing import Optional


class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str = "python"


class AutocompleteResponse(BaseModel):
    suggestion: str
    insertPosition: int
    confidence: float = 0.8