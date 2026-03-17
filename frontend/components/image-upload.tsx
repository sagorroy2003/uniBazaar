"use client";

import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
    onChange: (value: string) => void;
    value: string;
}

type UploadResult = {
    info?: {
        secure_url?: string;
    };
};

export default function ImageUpload({ onChange, value }: ImageUploadProps) {
    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(result: unknown) => {
                const secureUrl = (result as UploadResult | undefined)?.info?.secure_url;

                if (typeof secureUrl === "string" && secureUrl.length > 0) {
                    onChange(secureUrl);
                }
            }}
            options={{
                maxFiles: 1,
            }}
        >
            {({ open }: { open?: () => void }) => {
                return (
                    <div
                        onClick={() => open?.()}
                        className="relative cursor-pointer hover:opacity-70 transition border-dashed border-2 border-gray-300 flex flex-col justify-center items-center h-40 w-full rounded-lg bg-gray-50"
                    >
                        {value ? (
                            <div className="absolute inset-0 w-full h-full">
                                <img className="object-cover w-full h-full" src={value} alt="Upload" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-5 text-gray-500">
                                <span className="font-semibold text-lg">Click to upload</span>
                            </div>
                        )}
                    </div>
                );
            }}
        </CldUploadWidget>
    );
}