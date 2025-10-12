"""
File upload endpoints for images and videos.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pathlib import Path
import uuid
import os


router = APIRouter(prefix="/api/upload", tags=["File Upload"])

# Upload directory path
UPLOAD_DIR = Path("backend/uploads")


@router.post("")
async def upload_file(file: UploadFile = File(...), file_type: str = "image"):
    """
    Upload a file (image or video).
    Returns the URL path to access the uploaded file.
    """
    # Validate file type
    if file_type not in ["image", "video"]:
        raise HTTPException(
            status_code=400, detail="file_type must be 'image' or 'video'")

    # Validate file extension
    allowed_image_extensions = {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
    allowed_video_extensions = {".mp4", ".webm", ".ogg", ".mov", ".avi"}

    file_extension = Path(file.filename).suffix.lower()

    if file_type == "image" and file_extension not in allowed_image_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image file. Allowed: {', '.join(allowed_image_extensions)}"
        )

    if file_type == "video" and file_extension not in allowed_video_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid video file. Allowed: {', '.join(allowed_video_extensions)}"
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / f"{file_type}s" / unique_filename

    # Save file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to save file: {str(e)}")

    # Return the URL path
    file_url = f"/uploads/{file_type}s/{unique_filename}"
    return {"url": file_url, "filename": file.filename, "size": len(contents)}


@router.delete("")
async def delete_file(file_url: str):
    """Delete an uploaded file by its URL path."""
    try:
        # Extract the relative path from URL
        if file_url.startswith("/uploads/"):
            relative_path = file_url.replace("/uploads/", "")
            file_path = UPLOAD_DIR / relative_path

            if file_path.exists() and file_path.is_file():
                os.remove(file_path)
                return {"message": "File deleted successfully"}
            else:
                raise HTTPException(status_code=404, detail="File not found")
        else:
            raise HTTPException(status_code=400, detail="Invalid file URL")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete file: {str(e)}")
