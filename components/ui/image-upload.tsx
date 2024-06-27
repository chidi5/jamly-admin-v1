"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  hidden,
  className,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-4 w-fit items-center gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-52 h-52 rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className={cn("object-cover", className)}
              alt="Image"
              src={url}
            />
          </div>
        ))}
        <CldUploadWidget onUpload={onUpload} uploadPreset="ohz6jrp3">
          {({ open }) => {
            const onClick = () => {
              open();
            };

            return (
              <div
                className={cn(
                  "w-52 h-52 rounded-md overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center flex-col gap-3",
                  { " hidden": !hidden }
                )}
              >
                <Label>
                  <div className="w-full h-full flex flex-col gap-2 items-center justify-center cursor-pointer">
                    <ImagePlus className="w-5 h-5" />
                    <p>Upload image</p>
                  </div>
                  <Button
                    type="button"
                    disabled={disabled}
                    onClick={onClick}
                    className="p-0 w-0 h-0"
                  ></Button>
                </Label>
              </div>
            );
          }}
        </CldUploadWidget>
      </div>
      <CldUploadWidget onUpload={onUpload} uploadPreset="ohz6jrp3">
        {({ open }) => {
          const onClick = () => {
            open();
          };

          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
              className={hidden ? "hidden" : ""}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload an Image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
