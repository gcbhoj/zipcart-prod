
from huggingface_hub import HfFileSystem
from datasets import Dataset
import re


class ImageDataSetLoader:

    def __init__(self):

        self.hffs = HfFileSystem()

        self.BUCKET_PATH = (
            "buckets/BhojGC/zipcart/fruits_veg_data"
        )

        self.IMAGE_EXTENSIONS = (
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        )

    def get_class_name(self, folder_name):

        # Apple 10 -> Apple
        # Apple 11 -> Apple
        # Banana 1 -> Banana
        # Banana 2 -> Banana

        class_name = re.sub(
            r"\s+\d+$",
            "",
            folder_name
        )

        return class_name.strip()

    def init_data_set(self):

        image_files = self.hffs.glob(
            self.BUCKET_PATH + "/**"
        )

        records = []

        for file_path in image_files:

            if not file_path.lower().endswith(
                self.IMAGE_EXTENSIONS
            ):
                continue

            parts = file_path.split("/")

            # Expected structure:
            #
            # buckets/
            # BhojGC/
            # zipcart/
            # fruits_veg_data/
            # Training/
            # Apple 10/
            # image1.jpg

            split = parts[-3]

            folder_name = parts[-2]

            label = self.get_class_name(
                folder_name
            )

            records.append({
                "image_path": f"hf://{file_path}",
                "label": label,
                "split": split
            })

        data_set = Dataset.from_list(
            records
        )

        print(
            f"Found {len(data_set)} images"
        )

        return data_set

