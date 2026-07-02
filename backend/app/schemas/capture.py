import uuid
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class WebpageCaptureRequest(BaseModel):
    title: str = Field(..., description="Page title")
    url: str = Field(..., description="Source URL")
    content: str = Field(..., description="Cleaned page content (markdown/text)")
    collection_id: Optional[uuid.UUID] = None
    metadata: Optional[Dict[str, Any]] = None

class SelectionCaptureRequest(BaseModel):
    title: str = Field(..., description="Page title")
    url: str = Field(..., description="Source URL")
    selected_text: str = Field(..., description="Highlighted text")
    collection_id: Optional[uuid.UUID] = None
