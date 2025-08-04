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
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  isOpen,
  onClose,
  onCropComplete,
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
      const cropWidthInPercent = (Math.min(width, height) / width) * 100;
      const cropHeightInPercent = (Math.min(width, height) / height) * 100;

      const newCrop: Crop = {
        unit: '%',
        width: cropWidthInPercent * 0.9,
        height: cropHeightInPercent * 0.9,
        x: (100 - cropWidthInPercent * 0.9) / 2,
        y: (100 - cropHeightInPercent * 0.9) / 2,
      };

      setCrop(newCrop);

      // Also set the completed crop with pixel values
      const pixelCrop: PixelCrop = {
        unit: 'px',
        width: (width * cropWidthInPercent * 0.9) / 100,
        height: (height * cropHeightInPercent * 0.9) / 100,
        x: (width * (100 - cropWidthInPercent * 0.9)) / 200,
        y: (height * (100 - cropHeightInPercent * 0.9)) / 200,
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

    const targetWidth = Math.min(1200, crop.width * scaleX);
    const targetHeight = Math.min(1200, crop.height * scaleY);

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
          return;
        }
        const croppedImageUrl = URL.createObjectURL(blob);
        onCropComplete(croppedImageUrl);
        onClose();
      },
      'image/jpeg',
      1,
    );
  }, [completedCrop, onCropComplete, onClose]);

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
