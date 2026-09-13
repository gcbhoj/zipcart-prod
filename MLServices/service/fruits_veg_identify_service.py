import os
import logging
import json

import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from HF_config import hf_config
from urllib.parse import quote
from huggingface_hub import HfFileSystem



BASE_PATH = "/app"

DATA_DIR = "/app/data/image_uploads"

    
MODEL_PATH = "/app/ML_models/tlfinal.h5"

CLASS_NAMES_PATH = "/app/ML_models/class_names.json"

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
                

                logger.info(
                        "Prediction index: %s",
                        index
                    )

                logger.info(
                        "Class name from class_names[%s]: %r",
                        index,
                        self.class_names[index]
                    )


                
                class_name = self.class_names[index]

                prediction_results.append({
                    "class": class_name,
                    "confidence": round(
                        float(predictions[index]) * 100,
                        2
                    ),
                    "image": self._get_image_link(
                        class_name
                    )
                })

            best_index = top_indices[0]

            logger.info(
                "Prediction completed for %s: %s (%.2f%%)",
                self.file_name,
                self.class_names[best_index],
                float(predictions[best_index]) * 100
            )

            return {
                "success": True,
                "message": {
                    "predictions": prediction_results
                }
            }

        except Exception as error:

            logger.exception(
                "Fruit and vegetable prediction failed for: %s",
                self.file_name
            )

            return {
                "success": False,
                "message": str(error)
            }

        finally:
            logger.info("Deletion started for image: %s", self.file_name)

            self._remove_image(self.file_path)
            logger.info("Deletion completed for image: %s", self.file_name)



    def _load_model(self):

        logger.info("Loading fruit and vegetable ML model: %s",MODEL_PATH)

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
    
    def _remove_image(self, image_path):

        logger.info(
            "Attempting to remove image: %s",
            image_path
        )

        if not image_path:
            logger.warning(
                "Image path was not provided for deletion."
            )
            return False

        absolute_path = os.path.abspath(image_path)

        logger.info(
            "Absolute image path: %s",
            absolute_path
        )

        logger.info(
            "Image exists before deletion: %s",
            os.path.isfile(absolute_path)
        )

        if not os.path.isfile(absolute_path):

            logger.warning(
                "Image does not exist and cannot be deleted: %s",
                absolute_path
            )

            return False

        try:

            os.remove(absolute_path)

            logger.info(
                "Image removed successfully: %s",
                absolute_path
            )

            logger.info(
                "Image exists after deletion: %s",
                os.path.isfile(absolute_path)
            )

            return True

        except OSError as error:

            logger.exception(
                "Failed to remove image: %s",
                absolute_path
            )

            return False
        
    from urllib.parse import quote


    def _get_image_link(self, class_name):

        if not class_name:
            logger.warning(
                "Class name was not provided for image lookup."
            )
            return None

        try:

            fs = HfFileSystem(
                token=hf_config.HF_TOKEN
            )

            class_path = (
                f"{hf_config.BUCKET_URI}/"
                f"fruits_veg_data/"
                f"Test/"
                f"{class_name}"
            )

            logger.info(
                "Searching class folder: %s",
                class_path
            )

            files = fs.glob(
                f"{class_path}/*"
            )

            if not files:

                logger.warning(
                    "No files found for class: %r",
                    class_name
                )

                return None

            image_extensions = (
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            )

            image_path = next(
                (
                    file_path
                    for file_path in files
                    if file_path.lower().endswith(image_extensions)
                ),
                None
            )

            if not image_path:

                logger.warning(
                    "No image files found for class: %r",
                    class_name
                )

                return None

            logger.info(
                "Selected image path from HF: %s",
                image_path
            )

            # ------------------------------------------------
            # Normalize the HF path
            # ------------------------------------------------
            #
            # Possible value:
            #
            # hf://buckets/BhojGC/zipcart/fruits_veg_data/Test/...
            #
            # or:
            #
            # buckets/BhojGC/zipcart/fruits_veg_data/Test/...
            #
            # We only need:
            #
            # fruits_veg_data/Test/...
            # ------------------------------------------------

            marker = "zipcart/"

            if marker not in image_path:

                logger.error(
                    "Unexpected HF image path format: %s",
                    image_path
                )

                return None

            relative_path = image_path.split(
                marker,
                1
            )[1]

            # URL encode each path component
            encoded_path = "/".join(
                quote(
                    part,
                    safe=""
                )
                for part in relative_path.split("/")
            )

            image_url = (
                f"{hf_config.BASE_BUCKET}"
                f"/resolve/"
                f"{encoded_path}"
            )

            logger.info(
                "Class: %r",
                class_name
            )

            logger.info(
                "Relative path: %s",
                relative_path
            )

            logger.info(
                "Encoded path: %s",
                encoded_path
            )

            logger.info(
                "Generated image URL: %s",
                image_url
            )

            return image_url

        except Exception:

            logger.exception(
                "Failed to generate image URL for class: %s",
                class_name
            )

            return None




