import React, { Suspense } from "react";
import { Navbar } from "./navbar";
import { TemplateGallery } from "./templates-gallery";
import { RecentDocuments } from "./recent-documents";

const Page = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="fixed top-0 left-0 right-0 z-10 h-16u bg-white p-4">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>
      <div className="mt-20">
        <Suspense fallback={null}>
          <TemplateGallery />
        </Suspense>
        <Suspense fallback={
          <div className="max-w-screen-xl mx-auto px-16 py-6">
            <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-52 bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        }>
          <RecentDocuments />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
