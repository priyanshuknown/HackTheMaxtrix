import os
import mimetypes
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from app.config import settings
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/files", tags=["Files"])

@router.get("/{file_id}")
async def get_file(
    file_id: str,
    current_user: User = Depends(get_current_user)
):
    """Serve uploaded files securely."""
    # Basic path traversal protection
    if ".." in file_id or "/" in file_id or "\\" in file_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file ID")
        
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    file_path = os.path.join(upload_dir, file_id)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
    # In a real app we'd verify the user owns the file or is an admin/funder who has the right to see it.
    # For now, simply requiring auth is better than public access.
    
    mime_type, _ = mimetypes.guess_type(file_path)
    return FileResponse(file_path, media_type=mime_type or "application/octet-stream")
