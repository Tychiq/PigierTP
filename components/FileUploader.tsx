"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => file.size <= MAX_FILE_SIZE);
    const oversizedFiles = acceptedFiles.filter((file) => file.size > MAX_FILE_SIZE);

    oversizedFiles.forEach((file) => {
      toast({
        description: (
          <p className="body-2 text-white">
            <span className="font-semibold">{file.name}</span> est trop lourd.
            La taille maximale du fichier est de 50 Mo.
          </p>
        ),
        className: "error-toast",
      });
    });

    setFiles((prev) => [...prev, ...validFiles]);
  }, [toast]);

  const handleRemoveFile = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleConfirmUpload = async (file: File) => {
    setUploading(file.name);
    const result = await uploadFile({ file, ownerId, accountId, path });

    if (!result.success) {
      toast({
        description: (
          <p className="body-2 text-white">
            <span className="font-semibold">{file.name}</span> n’a pas été importé :
            {` ${result.message}`}
          </p>
        ),
        className: "error-toast",
      });
    } else {
      toast({
        description: (
          <p className="body-2 text-brand">
            <span className="font-semibold">{file.name}</span> a été importé avec succès.
          </p>
        ),
        className: "success-toast",
      });
      setFiles((prev) => prev.filter((f) => f.name !== file.name));
    }

    setUploading(null);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        <Button type="button" className={cn("uploader-button", className)}>
          <Image src="/assets/icons/upload.svg" alt="upload" width={24} height={24} />
          <p>Importer</p>
        </Button>
      </div>

      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Aperçu avant importation</h4>
          {files.map((file) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li key={file.name} className="uploader-preview-item">
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="flex flex-col">
                    <span className="font-semibold">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={uploading === file.name}
                    onClick={() => handleConfirmUpload(file)}
                  >
                    {uploading === file.name ? "Importation..." : "Confirmer"}
                  </Button>

                  <Image
                    src="/assets/icons/remove.svg"
                    width={24}
                    height={24}
                    alt="Remove"
                    className="cursor-pointer"
                    onClick={(e) => handleRemoveFile(e, file.name)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
