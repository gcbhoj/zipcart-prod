import os
import logging
import json

import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


BASE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data")
)

DATA_DIR = os.path.join(
    BASE_PATH,
    "image_uploads"
)

ML_DIR = os.path.join(
    BASE_PATH,
    "ML_models"
)

MODEL_PATH = os.path.join(
    ML_DIR,
    "tlfinal.h5"
)

CLASS_NAMES_PATH = os.path.join(
    ML_DIR,
    "class_names.json"
)

logger = logging.getLogger("flask_app")


class PredictFruitNVeg:

    def __init__(self, file_name):

        logger.info(
            "Service layer started: Predicting Fruit & Vegetable"
        )

        if not file_name:
            logger.warning(
                "File name was not provided for Fruit & Vegetable prediction"
            )

            raise ValueError(
                "File Name is Required"
            )

        self.file_name = file_name

        self.file_path = os.path.join(
            DATA_DIR,
            self.file_name
        )

        if not os.path.isfile(self.file_path):

            logger.warning(
                "Uploaded image does not exist: %s",
                self.file_path
            )

            raise FileNotFoundError(
                "File Does Not Exist in Upload Folder"
            )

        logger.info(
            "Uploaded image located successfully: %s",
            self.file_name
        )

        self.model = self._load_model()
        self.class_names = self._load_class_names()


    def predict(self):

        logger.info(
            "Starting fruit and vegetable prediction for: %s",
            self.file_name
        )

        try:

            image_data = self._process_image()

            predictions = self.model.predict(
                image_data,
                verbose=0
            )[0]

            if len(predictions) != len(self.class_names):

                logger.error(
                    "Model/class mismatch. Model outputs: %s, "
                    "Class names: %s",
                    len(predictions),
                    len(self.class_names)
                )

                raise ValueError(
                    "Model output count does not match class names"
                )

            # Get top 10 predictions
            top_n = min(
                10,
                len(predictions)
            )

            top_indices = np.argsort(
                predictions
            )[-top_n:][::-1]

            prediction_results = []

            for index in top_indices:

                prediction_results.append({
                    "class": self.class_names[index],
                    "confidence": round(
                        float(predictions[index]) * 100,
                        2
                    )
                })

            best_index = top_indices[0]

            logger.info(
                "Prediction completed for %s: %s (%.2f%%)",
                self.file_name,
                self.class_names[best_index],
                float(predictions[best_index]) * 100
            )

            result = {
                "success": True,
                "message": {
                    "predictions": prediction_results
                }
            }

            return result

        except Exception as error:

            logger.exception(
                "Fruit and vegetable prediction failed for: %s",
                self.file_name
            )

            return {
                "success": False,
                "message": str(error)
            }


    def _load_model(self):

        logger.info(
            "Loading fruit and vegetable ML model: %s",
            MODEL_PATH
        )

        if not os.path.isfile(MODEL_PATH):

            logger.error(
                "ML model does not exist: %s",
                MODEL_PATH
            )

            raise FileNotFoundError(
                "ML Model Does Not Exist"
            )

        model = load_model(
            MODEL_PATH
        )

        logger.info(
            "Fruit and vegetable ML model loaded successfully"
        )

        return model


    def _load_class_names(self):

        logger.info(
            "Loading fruit and vegetable class names: %s",
            CLASS_NAMES_PATH
        )

        if not os.path.isfile(CLASS_NAMES_PATH):

            logger.error(
                "Class names file does not exist: %s",
                CLASS_NAMES_PATH
            )

            raise FileNotFoundError(
                "Class Names File Does Not Exist"
            )

        with open(
            CLASS_NAMES_PATH,
            "r"
        ) as file:

            class_names = json.load(file)

        logger.info(
            "Loaded %s fruit and vegetable classes",
            len(class_names)
        )

        return class_names


    def _process_image(self):

        logger.info(
            "Processing uploaded image: %s",
            self.file_name
        )

        img = image.load_img(
            self.file_path,
            target_size=(100, 100)
        )

        img_array = image.img_to_array(
            img
        )

        # Same preprocessing used during training
        img_array = img_array / 255.0

        # Add batch dimension
        img_batch = np.expand_dims(
            img_array,
            axis=0
        )

        logger.info(
            "Image processed successfully: %s",
            self.file_name
        )

        return img_batch