"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { templates } from "@/constants/templates";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export const TemplateGallery = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);

  const onTemplateClick = async (templateId: string, title?: string) => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    setIsCreating(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ templateId, title }),
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      const data = await response.json();
      router.push(`/documents/${data.docId}`);
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  };

  return (
    <div className="bg-[#F1F3F4] ">
      <div className="max-w-screen-xl mx-auto px-16 py-6 flex flex-col gap-y-4">
        <h3 className="font-medium"></h3>
        <Carousel>
          <CarouselContent className="-ml-4">
            {templates.map((template) => (
              <CarouselItem
                key={template.id}
                className="basis-1/2  sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/ 2xl:basis-[14.285714%] pl-4"
              >
                <div
                  className={cn(
                    "aspect-[3/4] flex flex-col gap-y-2.5",
                    isCreating && "pointer-events-none opacity-50 ",
                  )}
                >
                  <button
                    disabled={isCreating}
                    onClick={() => onTemplateClick(template.id, template.label)}
                    style={{
                      backgroundImage: `url(${template.imageUrl}) `,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    className="size-full hover:border-blue-500 rounded-sm hover:border hover:bg-blue-50 transition flex-col items-center justify-center gap-y-4 bg-white"
                  />
                  <p className="text-sm font-medium truncate">
                    {template.label}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};
