"use client";

import Image from "next/image";
import Link from "next/link";
import DocumentInput from "./document-input";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BoldIcon,
  ChevronDown,
  FileIcon,
  FileTextIcon,
  GlobeIcon,
  ItalicIcon,
  LogOut,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  TextIcon,
  UnderlineIcon,
  Undo2Icon,
  FileCode2Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  ImageIcon,
  TableIcon,
  MinusIcon,
  Link2Icon,
  PilcrowIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  ListIcon,
  ListOrderedIcon,
  ListCollapseIcon,
  SubscriptIcon,
  SuperscriptIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useEditorStore } from "@/store/use-editor-store";

interface NavbarProps {
  documentId: string;
}

const Navbar = ({ documentId }: NavbarProps) => {
  const { user, logout } = useAuthStore();
  const { editor } = useEditorStore();

  // File menu actions
  const onSave = () => {
    // Document auto-saves via Yjs, this is a no-op confirmation
    const event = new CustomEvent("document-save");
    window.dispatchEvent(event);
  };

  const onDownloadHTML = () => {
    if (!editor) return;
    const html = editor.getHTML();
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDownloadText = () => {
    if (!editor) return;
    const text = editor.getText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDownloadJSON = () => {
    if (!editor) return;
    const json = editor.getJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Insert table
  const onInsertTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <nav className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={45} height={45} />
        </Link>
        <div className="flex flex-col">
          <DocumentInput documentId={documentId} />
          <div className="flex">
            <Menubar className="border-none bg-transparent shadow-none h-auto p-0">
              {/* ─────────── FILE MENU ─────────── */}
              <MenubarMenu>
                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                  File
                </MenubarTrigger>
                <MenubarContent className="bg-white border border-neutral-200 shadow-md rounded-md min-w-[220px]">
                  <MenubarItem onClick={onSave}>
                    <FileIcon className="size-4 mr-2" />
                    Save
                    <MenubarShortcut>⌘S</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>
                      <FileTextIcon className="size-4 mr-2" />
                      Download
                    </MenubarSubTrigger>
                    <MenubarSubContent className="bg-white border border-neutral-200 shadow-md">
                      <MenubarItem onClick={onDownloadHTML}>
                        <GlobeIcon className="size-4 mr-2" />
                        HTML (.html)
                      </MenubarItem>
                      <MenubarItem onClick={onDownloadText}>
                        <TextIcon className="size-4 mr-2" />
                        Plain Text (.txt)
                      </MenubarItem>
                      <MenubarItem onClick={onDownloadJSON}>
                        <FileCode2Icon className="size-4 mr-2" />
                        JSON (.json)
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => window.print()}>
                    <PrinterIcon className="size-4 mr-2" />
                    Print
                    <MenubarShortcut>⌘P</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              {/* ─────────── EDIT MENU ─────────── */}
              <MenubarMenu>
                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                  Edit
                </MenubarTrigger>
                <MenubarContent className="bg-white border border-neutral-200 shadow-md rounded-md min-w-[220px]">
                  <MenubarItem
                    onClick={() => editor?.chain().focus().undo().run()}
                  >
                    <Undo2Icon className="size-4 mr-2" />
                    Undo
                    <MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => editor?.chain().focus().redo().run()}
                  >
                    <Redo2Icon className="size-4 mr-2" />
                    Redo
                    <MenubarShortcut>⌘Y</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() =>
                      document.execCommand("cut")
                    }
                  >
                    Cut
                    <MenubarShortcut>⌘X</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() =>
                      document.execCommand("copy")
                    }
                  >
                    Copy
                    <MenubarShortcut>⌘C</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() =>
                      document.execCommand("paste")
                    }
                  >
                    Paste
                    <MenubarShortcut>⌘V</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() =>
                      editor?.chain().focus().selectAll().run()
                    }
                  >
                    Select All
                    <MenubarShortcut>⌘A</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              {/* ─────────── INSERT MENU ─────────── */}
              <MenubarMenu>
                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                  Insert
                </MenubarTrigger>
                <MenubarContent className="bg-white border border-neutral-200 shadow-md rounded-md min-w-[220px]">
                  <MenubarSub>
                    <MenubarSubTrigger>
                      <ImageIcon className="size-4 mr-2" />
                      Image
                    </MenubarSubTrigger>
                    <MenubarSubContent className="bg-white border border-neutral-200 shadow-md">
                      <MenubarItem
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              const imageUrl = URL.createObjectURL(file);
                              editor
                                ?.chain()
                                .focus()
                                .setImage({ src: imageUrl })
                                .run();
                            }
                          };
                          input.click();
                        }}
                      >
                        Upload from computer
                      </MenubarItem>
                      <MenubarItem
                        onClick={() => {
                          const url = prompt("Enter image URL:");
                          if (url) {
                            editor
                              ?.chain()
                              .focus()
                              .setImage({ src: url })
                              .run();
                          }
                        }}
                      >
                        By URL
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarItem onClick={onInsertTable}>
                    <TableIcon className="size-4 mr-2" />
                    Table
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() =>
                      editor?.chain().focus().setHorizontalRule().run()
                    }
                  >
                    <MinusIcon className="size-4 mr-2" />
                    Horizontal Rule
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => {
                      const url = prompt("Enter link URL:");
                      if (url) {
                        editor
                          ?.chain()
                          .focus()
                          .extendMarkRange("link")
                          .setLink({ href: url })
                          .run();
                      }
                    }}
                  >
                    <Link2Icon className="size-4 mr-2" />
                    Link
                    <MenubarShortcut>⌘K</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() =>
                      editor?.chain().focus().setHardBreak().run()
                    }
                  >
                    <PilcrowIcon className="size-4 mr-2" />
                    Page Break
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              {/* ─────────── FORMAT MENU ─────────── */}
              <MenubarMenu>
                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                  Format
                </MenubarTrigger>
                <MenubarContent className="bg-white border border-neutral-200 shadow-md rounded-md min-w-[220px]">
                  {/* Text Style */}
                  <MenubarSub>
                    <MenubarSubTrigger>
                      <TextIcon className="size-4 mr-2" />
                      Text
                    </MenubarSubTrigger>
                    <MenubarSubContent className="bg-white border border-neutral-200 shadow-md min-w-[180px]">
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().toggleBold().run()
                        }
                      >
                        <BoldIcon className="size-4 mr-2" />
                        Bold
                        <MenubarShortcut>⌘B</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().toggleItalic().run()
                        }
                      >
                        <ItalicIcon className="size-4 mr-2" />
                        Italic
                        <MenubarShortcut>⌘I</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().toggleUnderline().run()
                        }
                      >
                        <UnderlineIcon className="size-4 mr-2" />
                        Underline
                        <MenubarShortcut>⌘U</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().toggleStrike().run()
                        }
                      >
                        <StrikethroughIcon className="size-4 mr-2" />
                        Strikethrough
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  {/* Headings */}
                  <MenubarSub>
                    <MenubarSubTrigger>
                      <Heading1Icon className="size-4 mr-2" />
                      Heading
                    </MenubarSubTrigger>
                    <MenubarSubContent className="bg-white border border-neutral-200 shadow-md">
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().setParagraph().run()
                        }
                      >
                        <PilcrowIcon className="size-4 mr-2" />
                        Normal Text
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                      >
                        <Heading1Icon className="size-4 mr-2" />
                        Heading 1
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                      >
                        <Heading2Icon className="size-4 mr-2" />
                        Heading 2
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                        }
                      >
                        <Heading3Icon className="size-4 mr-2" />
                        Heading 3
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 4 })
                            .run()
                        }
                      >
                        <Heading4Icon className="size-4 mr-2" />
                        Heading 4
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 5 })
                            .run()
                        }
                      >
                        <Heading5Icon className="size-4 mr-2" />
                        Heading 5
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  <MenubarSeparator />

                  {/* Alignment */}
                  <MenubarSub>
                    <MenubarSubTrigger>
                      <AlignLeftIcon className="size-4 mr-2" />
                      Align
                    </MenubarSubTrigger>
                    <MenubarSubContent className="bg-white border border-neutral-200 shadow-md">
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("left").run()
                        }
                      >
                        <AlignLeftIcon className="size-4 mr-2" />
                        Align Left
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("center").run()
                        }
                      >
                        <AlignCenterIcon className="size-4 mr-2" />
                        Align Center
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("right").run()
                        }
                      >
                        <AlignRightIcon className="size-4 mr-2" />
                        Align Right
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("justify").run()
                        }
                      >
                        <AlignJustifyIcon className="size-4 mr-2" />
                        Justify
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  {/* Line Spacing */}
                  <MenubarSub>
                    <MenubarSubTrigger>
                      <ListCollapseIcon className="size-4 mr-2" />
                      Line Spacing
                    </MenubarSubTrigger>
                    <MenubarSubContent className="bg-white border border-neutral-200 shadow-md">
                      {[
                        { label: "Default", value: "normal" },
                        { label: "Single", value: "1" },
                        { label: "1.15", value: "1.15" },
                        { label: "1.5", value: "1.5" },
                        { label: "Double", value: "2" },
                      ].map(({ label, value }) => (
                        <MenubarItem
                          key={value}
                          onClick={() =>
                            editor?.chain().focus().setLineHeight(value).run()
                          }
                        >
                          {label}
                        </MenubarItem>
                      ))}
                    </MenubarSubContent>
                  </MenubarSub>

                  {/* Lists */}
                  <MenubarSub>
                    <MenubarSubTrigger>
                      <ListIcon className="size-4 mr-2" />
                      Lists
                    </MenubarSubTrigger>
                    <MenubarSubContent className="bg-white border border-neutral-200 shadow-md">
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().toggleBulletList().run()
                        }
                      >
                        <ListIcon className="size-4 mr-2" />
                        Bullet List
                      </MenubarItem>
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().toggleOrderedList().run()
                        }
                      >
                        <ListOrderedIcon className="size-4 mr-2" />
                        Numbered List
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() =>
                      editor?.chain().focus().unsetAllMarks().run()
                    }
                  >
                    <RemoveFormattingIcon className="size-4 mr-2" />
                    Clear Formatting
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-neutral-100 p-1 pr-2 transition-colors">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
