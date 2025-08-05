import React, { useCallback, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/base';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMB?: number;
  quality?: number;
  onError?: (message: string) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  isOpen,
  onClose,
  onCropComplete,
  maxWidth = 1200,
  maxHeight = 1200,
  maxSizeMB = 10,
  quality = 0.9,
  onError,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Note: blob URL cleanup is handled by the parent component (PhotoUpload)
  // ImageCropper should not clean up URLs it doesn't own

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      // Calculate the size for a square crop (1:1 aspect ratio)
      const minDimension = Math.min(width, height);
      const cropSizeInPercent =
        (minDimension / Math.max(width, height)) * 100 * 0.9;

      // For 1:1 aspect ratio, width and height percentages are calculated differently
      const cropWidthPercent =
        width >= height
          ? cropSizeInPercent
          : (minDimension / width) * 100 * 0.9;
      const cropHeightPercent =
        height >= width
          ? cropSizeInPercent
          : (minDimension / height) * 100 * 0.9;

      const newCrop: Crop = {
        unit: '%',
        width: cropWidthPercent,
        height: cropHeightPercent,
        x: (100 - cropWidthPercent) / 2,
        y: (100 - cropHeightPercent) / 2,
      };

      setCrop(newCrop);

      // Also set the completed crop with pixel values
      const pixelSize = minDimension * 0.9;
      const pixelCrop: PixelCrop = {
        unit: 'px',
        width: pixelSize,
        height: pixelSize,
        x: (width - pixelSize) / 2,
        y: (height - pixelSize) / 2,
      };
      setCompletedCrop(pixelCrop);
    },
    [],
  );

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const targetWidth = Math.min(maxWidth, crop.width * scaleX);
    const targetHeight = Math.min(maxHeight, crop.height * scaleY);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      targetWidth,
      targetHeight,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          onError?.('Failed to generate cropped image');
          return;
        }

        // Validate cropped image size
        if (blob.size > maxSizeMB * 1024 * 1024) {
          onError?.(
            `Cropped image exceeds ${maxSizeMB}MB limit. Please crop a smaller area.`,
          );
          return;
        }

        const croppedImageUrl = URL.createObjectURL(blob);
        onCropComplete(croppedImageUrl);
        onClose();
      },
      'image/jpeg',
      quality,
    );
  }, [
    completedCrop,
    onCropComplete,
    onClose,
    maxWidth,
    maxHeight,
    maxSizeMB,
    quality,
    onError,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      classNames={{
        body: 'mt-[20px] py-6',
        backdrop: 'bg-background/80 backdrop-blur-sm',
        base: 'min-w-[400px] max-w-[80vw] w-auto bg-white',
        footer: 'mt-[20px] flex justify-end',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Crop Image</ModalHeader>
        <ModalBody>
          <div className="flex w-full flex-col items-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              className="max-h-[80vh] w-auto"
            >
              <img
                ref={imgRef}
                alt="Crop"
                src={src}
                className="mx-auto max-h-[80vh] w-auto"
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <canvas
              ref={previewCanvasRef}
              style={{
                display: 'none',
              }}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={generateCroppedImage}>
            Apply Crop
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
