import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Collection name")

class CollectionResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
    document_count: int = 0

    model_config = {"from_attributes": True}
