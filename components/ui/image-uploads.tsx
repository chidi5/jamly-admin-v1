"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";
import { PuffLoader } from "react-spinners";
import { Label } from "./label";
import { Input } from "./input";

type ImageUploadProps = {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
};

const ImageUploads: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = async (e: any) => {
    const file = e.target.files[0];
    console.log(file);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value && value.length > 0 ? (
          <>
            {value.map((url) => (
              <div
                key={url}
                className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
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
                <Image fill className="object-contain" alt="Image" src={url} />
              </div>
            ))}
          </>
        ) : (
          <div className="w-52 h-52 rounded-md overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center flex-col gap-3">
            {isLoading ? (
              <>
                <PuffLoader size={30} color="#555555" />
                <p>{`${progress.toFixed(2)}%`}</p>
              </>
            ) : (
              <>
                <Label>
                  <div className="w-full h-full flex flex-col gap-2 items-center justify-center cursor-pointer">
                    <ImagePlus className="w-5 h-5" />
                    <p>Upload image</p>
                  </div>
                  <Input
                    type="file"
                    onChange={onUpload}
                    accept="image/*"
                    className="w-0 h-0 p-0"
                  />
                </Label>
              </>
            )}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div>
          <Button type="button" disabled={disabled} variant="secondary">
            <ImagePlus className="h-4 w-4 mr-2" />
            Upload an Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploads;
