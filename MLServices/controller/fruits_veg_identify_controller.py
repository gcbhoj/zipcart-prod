import os
import uuid
import logging

from flask import request, jsonify
from werkzeug.utils import secure_filename

from service.fruits_veg_identify_service import PredictFruitNVeg

ALLOWED_EXTENSIONS = {".jpg", ".jpeg"}

BASE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data")
)

UPLOAD_FOLDER = os.path.join(
    BASE_PATH,
    "image_uploads"
)

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

logger = logging.getLogger("flask_app")


def predict_fruit_veg():

    # ============================================================
    # CHECK FILE
    # ============================================================

    if "file" not in request.files:

        logger.warning(
            "File not uploaded during fruit and vegetable prediction."
        )

        return jsonify({
            "success": False,
            "message": "No file uploaded."
        }), 400

    file = request.files["file"]

    # ============================================================
    # CHECK FILENAME
    # ============================================================

    if not file.filename:

        logger.warning(
            "Empty filename received during fruit and vegetable prediction."
        )

        return jsonify({
            "success": False,
            "message": "No file uploaded."
        }), 400

    # ============================================================
    # CHECK FILE EXTENSION
    # ============================================================
    

    _, extension = os.path.splitext(file.filename)

    if extension.lower() not in ALLOWED_EXTENSIONS:

        logger.warning(
            "Invalid file type received: %s",
            extension
        )

        return jsonify({
            "success": False,
            "message": (
                "Expected JPG format file. "
                "Received another file type."
            )
        }), 400

    try:

        # ========================================================
        # SECURE FILENAME
        # ========================================================

        filename = secure_filename(file.filename)

        if not filename:

            logger.warning(
                "Invalid filename received during image upload."
            )

            return jsonify({
                "success": False,
                "message": "Invalid filename."
            }), 400

        # ========================================================
        # GENERATE UNIQUE FILENAME
        # ========================================================

        unique_name = f"{uuid.uuid4()}_{filename}"

        temp_file_path = os.path.join(
            UPLOAD_FOLDER,
            unique_name
        )

        # ========================================================
        # SAVE FILE
        # ========================================================

        file.save(temp_file_path)

        logger.info(
            "Image uploaded successfully: %s",
            unique_name
        )

        # ========================================================
        # CREATE PREDICTION SERVICE
        # ========================================================

        predictor = PredictFruitNVeg(unique_name)

        # ========================================================
        # RUN PREDICTION
        # ========================================================

        result = predictor.predict()

        logger.info(
            "Fruit and vegetable prediction completed: %s",
            unique_name
        )

        # `result` is already a dictionary
        return jsonify(result), 200

    except Exception:

        logger.exception(
            "Failed to process fruit and vegetable image."
        )

        return jsonify({
            "success": False,
            "message": "Failed to process image."
        }), 500