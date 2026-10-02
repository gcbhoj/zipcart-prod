import os
import logging
import json

import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from urllib.parse import quote

BASE_PATH = "/app"

DATA_DIR = "/app/data/image_uploads"


MODEL_PATH = "/app/ML_models/fruits_veg_identify_v2.keras"

CLASS_NAMES_PATH = "/app/ML_models/class_names.json"
FRUIT_IMAGE_DIRECTORY = "/app/data/Fruits_data/test"

logger = logging.getLogger("flask_app")


class PredictFruitNVeg:

    def __init__(self, file_name):

        if not file_name:
            raise ValueError("File Name is Required")

        self.file_name = file_name

        self.file_path = os.path.join(DATA_DIR, self.file_name)

        if not os.path.isfile(self.file_path):
            raise FileNotFoundError("File Does Not Exist in Upload Folder")

        self.model = self._load_model()
        self.class_names = self._load_class_names()

    def predict(self):

        try:

            image_data = self._process_image()

            predictions = self.model.predict(image_data, verbose=0)[0]

            predictions = np.squeeze(predictions)

            if len(predictions) != len(self.class_names):
                raise ValueError("Model output count does not match class names")

            # Best Prediction
            predicted_index = int(np.argmax(predictions))
            predicted_class = self.class_names[predicted_index]
            confidence = float(predictions[predicted_index])
            confidence_percent = round(confidence * 100, 2)

            # Threshold

            # if confidence < threshold:

            #     logger.info(
            #         "Prediction confidence %.2f%% is below threshold %.2f%%",
            #         confidence_percent,
            #         threshold * 100,
            #     )
            #     product_name = "Unknown"
            #     image_url = ""

            # else:

            #     product_name = predicted_class
            #     image_url = self._get_image_url(predicted_class)

            result = {
                "confidence": confidence_percent,
                "productName": predicted_class,
                "image": self._get_image_url(predicted_class),
            }

            # Get top 3predictions
            top_indices = np.argsort(predictions)[::-1]

            top_predictions = []

            for index in top_indices:
                if index == predicted_index:
                    continue

                class_name = self.class_names[index]
                top_predictions.append(
                    {
                        "productName": class_name,
                        "confidence": round(float(predictions[index]) * 100, 2),
                        "image": self._get_image_url(class_name),
                    }
                )

                if len(top_predictions) == 3:
                    break

            return {"success": True, "data": result, "topPredictions": top_predictions}

        except Exception as error:

            return {"success": False, "message": str(error)}

        finally:

            self._remove_image(self.file_path)

    def _load_model(self):

        if not os.path.isfile(MODEL_PATH):

            raise FileNotFoundError("ML Model Does Not Exist")

        model = load_model(MODEL_PATH)

        return model

    def _load_class_names(self):

        if not os.path.isfile(CLASS_NAMES_PATH):

            raise FileNotFoundError("Class Names File Does Not Exist")

        with open(CLASS_NAMES_PATH, "r") as file:

            class_names = json.load(file)

        return class_names

    def _process_image(self):

        img = image.load_img(self.file_path, target_size=(100, 100))

        img_array = image.img_to_array(img)

        # Same preprocessing used during training
        img_array = img_array / 255.0

        # Add batch dimension
        img_batch = np.expand_dims(img_array, axis=0)

        return img_batch

    def _remove_image(self, image_path):

        if not image_path:
            return False

        absolute_path = os.path.abspath(image_path)

        if not os.path.isfile(absolute_path):
            return False

        try:

            os.remove(absolute_path)
            return True

        except OSError as error:
            return False

    def _get_image_url(self, class_name):

        class_directory = os.path.join(FRUIT_IMAGE_DIRECTORY, class_name)

        if not os.path.isdir(class_directory):
            return ""

        image_extensions = (".jpg", ".jpeg", ".png", ".webp")

        image_files = [
            filename
            for filename in os.listdir(class_directory)
            if filename.lower().endswith(image_extensions)
        ]

        if not image_files:
            return ""

        image_name = image_files[0]

        return (
            "http://10.0.2.2:50000/api/fruit-images/"
            f"{quote(class_name)}/"
            f"{quote(image_name)}"
        )
