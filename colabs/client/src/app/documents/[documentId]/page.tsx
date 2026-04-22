import React from "react";
import Toolbar from "./toolbar";
import Navbar from "./navbar";
import { DocumentCheck } from "./document-check";
import { CollaborationProvider } from "./collaboration-provider";
import { Editor } from "./editor";

interface DocumentIdProps {
  params: Promise<{ documentId: string }>;
}
const DocumentIdPage = async ({ params }: DocumentIdProps) => {
  const { documentId } = await params;
  return (
    <DocumentCheck documentId={documentId}>
      <CollaborationProvider documentId={documentId}>
        <div className="min-h-screen bg-[#FAFBFD]">
          <div className="flex flex-col px-4 pt-2 gap-y-2 fixed top-0 left-0 right-0 z-10 bg-[#FAFBFD] print:hidden ">
            <Navbar documentId={documentId} />
            <Toolbar />
          </div>
          <div className="pt-[114px] print:pt-0">
            <Editor />
          </div>
        </div>
      </CollaborationProvider>
    </DocumentCheck>
  );
};

export default DocumentIdPage;
