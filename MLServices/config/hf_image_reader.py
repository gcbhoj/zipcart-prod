from huggingface_hub import HfFileSystem
import numpy as np
import tensorflow as tf
from PIL import Image


class HuggingFaceImageReader(
    tf.keras.utils.Sequence
):

    def __init__(
        self,
        dataset,
        class_to_index,
        batch_size=16,
        target_size=(100, 100),
        datagen=None,
        shuffle=True,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.dataset = dataset

        self.class_to_index = class_to_index

        self.batch_size = batch_size

        self.target_size = target_size

        self.datagen = datagen

        self.shuffle = shuffle

        self.hffs = HfFileSystem()

        self.indexes = np.arange(
            len(self.dataset)
        )

        self.on_epoch_end()

    def __len__(self):

        return int(
            np.ceil(
                len(self.dataset) /
                self.batch_size
            )
        )

    def __getitem__(self, index):

        batch_indexes = self.indexes[
            index * self.batch_size:
            (index + 1) * self.batch_size
        ]

        images = []

        labels = []

        for dataset_index in batch_indexes:

            example = self.dataset[
                int(dataset_index)
            ]

            image_path = example["image_path"]

            # Remove hf:// because HfFileSystem
            # expects the bucket path
            image_path = image_path.replace(
                "hf://",
                ""
            )

            with self.hffs.open(
                image_path,
                "rb"
            ) as f:

                image = Image.open(f).convert(
                    "RGB"
                )

                image = image.resize(
                    (
                        self.target_size[1],
                        self.target_size[0]
                    )
                )

                image = np.asarray(
                    image,
                    dtype=np.float32
                )

            if self.datagen is not None:

                image = self.datagen.random_transform(
                    image
                )

                image = self.datagen.standardize(
                    image
                )

            images.append(image)

            label_name = example["label"]

            label = self.class_to_index[
                label_name
            ]

            labels.append(label)

        images = np.asarray(
            images,
            dtype=np.float32
        )

        labels = tf.keras.utils.to_categorical(
            labels,
            num_classes=len(
                self.class_to_index
            )
        )

        return images, labels

    def on_epoch_end(self):

        if self.shuffle:

            np.random.shuffle(
                self.indexes
            )