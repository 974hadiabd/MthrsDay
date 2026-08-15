from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class ReasonCreate(BaseModel):
    text: str
    account: str = "user"

class ReasonUpdate(BaseModel):
    text: str

class Reason(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    account: str = "user"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TimelineItemCreate(BaseModel):
    caption: str
    image: Optional[str] = None
    account: str = "user"

class TimelineItemUpdate(BaseModel):
    caption: Optional[str] = None
    image: Optional[str] = None

class TimelineItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    caption: str
    image: Optional[str] = None
    account: str = "user"
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ REASONS ENDPOINTS ============

def _account_query(account: str) -> dict:
    """Existing documents created before accounts were separated have no
    'account' field. Treat those as belonging to 'user' (the original account)
    so nothing that was already saved appears to vanish."""
    if account == "user":
        return {"$or": [{"account": "user"}, {"account": {"$exists": False}}]}
    return {"account": account}

@api_router.get("/reasons", response_model=List[Reason])
async def get_reasons(account: str = "user"):
    reasons = await db.reasons.find(_account_query(account), {"_id": 0}).to_list(1000)
    return reasons

@api_router.post("/reasons", response_model=Reason)
async def create_reason(data: ReasonCreate):
    reason = Reason(text=data.text, account=data.account)
    doc = reason.model_dump()
    await db.reasons.insert_one(doc)
    return reason

@api_router.put("/reasons/{reason_id}", response_model=Reason)
async def update_reason(reason_id: str, data: ReasonUpdate):
    result = await db.reasons.find_one_and_update(
        {"id": reason_id},
        {"$set": {"text": data.text}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Reason not found")
    del result["_id"]
    return result

@api_router.delete("/reasons/{reason_id}")
async def delete_reason(reason_id: str):
    result = await db.reasons.delete_one({"id": reason_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reason not found")
    return {"success": True}

# ============ TIMELINE ENDPOINTS ============

@api_router.get("/timeline", response_model=List[TimelineItem])
async def get_timeline(account: str = "user"):
    items = await db.timeline.find(_account_query(account), {"_id": 0}).to_list(1000)
    return items

@api_router.post("/timeline", response_model=TimelineItem)
async def create_timeline_item(data: TimelineItemCreate):
    item = TimelineItem(caption=data.caption, image=data.image, account=data.account)
    doc = item.model_dump()
    await db.timeline.insert_one(doc)
    return item

@api_router.put("/timeline/{item_id}", response_model=TimelineItem)
async def update_timeline_item(item_id: str, data: TimelineItemUpdate):
    update_data = {}
    if data.caption is not None:
        update_data["caption"] = data.caption
    if data.image is not None:
        update_data["image"] = data.image
    # Allow setting image to null (removing it)
    if "image" not in update_data and data.image is None:
        update_data["image"] = None
    
    result = await db.timeline.find_one_and_update(
        {"id": item_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Timeline item not found")
    del result["_id"]
    return result

@api_router.delete("/timeline/{item_id}")
async def delete_timeline_item(item_id: str):
    result = await db.timeline.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Timeline item not found")
    return {"success": True}

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "Beats of You API", "status": "ok"}

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
