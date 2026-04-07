"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export const DocumentCheck = ({ 
  documentId, 
  children 
}: { 
  documentId: string, 
  children: React.ReactNode 
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyDocument = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/documents/${documentId}`, {
          credentials: "include"
        });
        if (res.ok) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error("Error verifying document", error);
        setIsValid(false);
      }
    };
    verifyDocument();
  }, [documentId]);

  if (isValid === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAFBFD]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isValid === false) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <div className="flex items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            <span className="text-[22px] font-medium text-gray-600">CoLabs</span>
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-20">
          <h1 className="text-xl md:text-2xl font-bold text-black mb-4">
            Sorry, the file you have requested does not exist.
          </h1>
          <p className="text-base text-gray-700">
            Make sure that you have the correct URL and the file exists.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
