import React, { Suspense } from "react";
import { Navbar } from "./navbar";
import { TemplateGallery } from "./templates-gallery";

const Page = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-white p-4">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>
      <div className="mt-28">
        <TemplateGallery />
      </div>
    </div>
  );
};

export default Page;
