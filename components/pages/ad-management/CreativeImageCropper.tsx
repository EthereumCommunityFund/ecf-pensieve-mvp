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

interface CreativeImageCropperProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMB?: number;
  quality?: number;
  outputType?: string;
  onError?: (message: string) => void;
}

export const CreativeImageCropper: React.FC<CreativeImageCropperProps> = ({
  src,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  maxWidth = 1200,
  maxHeight = 1200,
  maxSizeMB = 10,
  quality = 0.9,
  outputType = 'image/jpeg',
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

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const safeAspect =
        Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;

      let cropWidth = width;
      let cropHeight = cropWidth / safeAspect;

      if (cropHeight > height) {
        cropHeight = height;
        cropWidth = cropHeight * safeAspect;
      }

      const paddingFactor = 0.9;
      const adjustedCropWidth = cropWidth * paddingFactor;
      const adjustedCropHeight = cropHeight * paddingFactor;

      const cropWidthPercent = (adjustedCropWidth / width) * 100;
      const cropHeightPercent = (adjustedCropHeight / height) * 100;

      const newCrop: Crop = {
        unit: '%',
        width: cropWidthPercent,
        height: cropHeightPercent,
        x: (100 - cropWidthPercent) / 2,
        y: (100 - cropHeightPercent) / 2,
      };

      setCrop(newCrop);

      const pixelCrop: PixelCrop = {
        unit: 'px',
        width: adjustedCropWidth,
        height: adjustedCropHeight,
        x: (width - adjustedCropWidth) / 2,
        y: (height - adjustedCropHeight) / 2,
      };
      setCompletedCrop(pixelCrop);
    },
    [aspectRatio],
  );

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const cropArea = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const cropWidthPx = cropArea.width * scaleX;
    const cropHeightPx = cropArea.height * scaleY;

    if (cropWidthPx <= 0 || cropHeightPx <= 0) {
      onError?.('Invalid crop selection. Please adjust the area and retry.');
      return;
    }

    const maxOutputWidth =
      typeof maxWidth === 'number' && maxWidth > 0 ? maxWidth : cropWidthPx;
    const maxOutputHeight =
      typeof maxHeight === 'number' && maxHeight > 0 ? maxHeight : cropHeightPx;

    const widthScale =
      cropWidthPx > 0 ? maxOutputWidth / cropWidthPx : Number.POSITIVE_INFINITY;
    const heightScale =
      cropHeightPx > 0
        ? maxOutputHeight / cropHeightPx
        : Number.POSITIVE_INFINITY;

    const scaleFactor = Math.min(1, widthScale, heightScale);

    const targetWidth = Math.max(1, Math.round(cropWidthPx * scaleFactor));
    const targetHeight = Math.max(1, Math.round(cropHeightPx * scaleFactor));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.imageSmoothingQuality = 'high';

    context.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      targetWidth,
      targetHeight,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onError?.('Failed to generate cropped image.');
          return;
        }

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
      outputType,
      quality,
    );
  }, [
    completedCrop,
    onClose,
    onCropComplete,
    maxHeight,
    maxSizeMB,
    maxWidth,
    onError,
    outputType,
    quality,
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
              aspect={aspectRatio}
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

export default CreativeImageCropper;
