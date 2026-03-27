"use client";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/use-editor-store";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ChevronDownIcon, HighlighterIcon, ImageIcon, ItalicIcon, Link2Icon, ListIcon, ListOrderedIcon, ListTodoIcon, LucideIcon, MessageSquarePlusIcon, PrinterIcon, Redo2Icon, RemoveFormattingIcon, SearchIcon, SpellCheckIcon, UnderlineIcon, Undo2Icon, UploadIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {type Level} from "@tiptap/extension-heading"
import {type ColorResult, SketchPicker} from 'react-color'
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog";

const ListButton = () => {
  const { editor } = useEditorStore();
  const lists=[
    {
      label:"Bullet List",
      icon:ListIcon,
      isActive:()=>editor?.isActive("bulletList"),
      onClick:()=>editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label:"Ordered List",
      icon:ListOrderedIcon,
      isActive:()=>editor?.isActive("orderedList"),
      onClick:()=>editor?.chain().focus().toggleOrderedList().run(),
    }
  ]
  

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-300">
          <ListIcon className="size-4"/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 bg-white border border-neutral-200 shadow-md">
        {lists.map(({label,icon:Icon,isActive,onClick})=>(
          <button key={label}
          onClick={onClick}
          className={cn("flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-300",
          isActive?.() &&  "bg-neutral-300"
          )}>
            <Icon className="size-4"/>
            <span className="text-sm">{label}</span>
          </button>

        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AlignButton = () => {
  const { editor } = useEditorStore();
  const alignments=[
    {
      label:"Align Left",
      value:"left",
      icon:AlignLeftIcon,
    },
    {
      label:"Align Center",
      value:"center",
      icon:AlignCenterIcon,
    },
    {
      label:"Align Right",
      value:"right",
      icon:AlignRightIcon,
    },
    {
      label:"Align Justify",
      value:"justify",
      icon:AlignJustifyIcon,
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-300">
          <AlignLeftIcon className="size-4"/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 bg-white border border-neutral-200 shadow-md">
        {alignments.map(({label,value,icon:Icon})=>(
          <button key={value}
          onClick={()=>{editor?.chain().focus().setTextAlign(value).run()}}
          className={cn("flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-300",
            editor?.isActive({textAlign:value}) &&  "bg-neutral-300"
          )}>
            <Icon className="size-4"/>
            <span className="text-sm">{label}</span>
          </button>

        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ImageButton=()=>{
  const {editor}=useEditorStore();
  const [isDialogOpen, setIsDialogOpen]=useState(false)
  const [imageUrl, setImageUrl]=useState(editor?.getAttributes("link").href || "")
  const onChange=(src:string)=>{
    editor?.chain().focus().setImage({src}).run();
  }

  const onUpload=()=>{
    const input=document.createElement("input");
    input.type="file";
    input.accept="image/*";
    input.onchange=(e)=>{
      const file=(e.target as HTMLInputElement).files?.[0]
      if (file){
        const imageUrl=URL.createObjectURL(file);
        onChange(imageUrl);
      }
    }
    input.click()
  }

  const handleUrlSubmit=()=>{
    if (imageUrl){
      onChange(imageUrl);
      setImageUrl("");
      setIsDialogOpen(false)
    }
  };

  return (<>
    <DropdownMenu>
      <DropdownMenuTrigger asChild >
        <button className="h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-300">
        <ImageIcon className="size-4"/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white border border-neutral-200 shadow-md">
        <DropdownMenuItem onClick={onUpload}>
          <UploadIcon  className="size-4 mr-2"/>
          Upload
        </DropdownMenuItem>
        <DropdownMenuItem onClick={()=>setIsDialogOpen(true)}>
          <SearchIcon  className="size-4 mr-2"/>
          Paste Image Url
        </DropdownMenuItem>
      </DropdownMenuContent >
    </DropdownMenu>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image URL</DialogTitle>
        </DialogHeader>
        <Input placeholder="Inser image URL" 
        value={imageUrl} 
        onChange={(e)=>setImageUrl(e.target.value)}
         onKeyDown={(e)=>{
          if(e.key==="Enter"){
            handleUrlSubmit();
          }
         }

        }/>

        <DialogFooter>
        <Button onClick={handleUrlSubmit}>
          Insert
        </Button>
      </DialogFooter>
      </DialogContent>
      
    </Dialog>
    </>
  );
}

const LinkButton=()=>{
  const {editor}=useEditorStore();
  const [value, setValue]=useState(editor?.getAttributes("link").href || "")
  const onChange=(href:string)=>{
    editor?.chain().focus().extendMarkRange("link").setLink({href}).run();
    setValue("");
  }

  return (
    <DropdownMenu onOpenChange={(open)=>{if (open){setValue(editor?.getAttributes("link").href || "")}}}>
      <DropdownMenuTrigger asChild >
        <button className="h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-300">
        <Link2Icon className="size-4"/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2.5 flex items-center gap-x-2 bg-white border border-neutral-200 shadow-md">
        <Input placeholder="https://example.com" value={value} onChange={(e)=> setValue(e.target.value)} />
        <Button onClick={()=>onChange(value)}>Apply</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
const HighlightColorButton = () => {
  const { editor } = useEditorStore();

  const value =
    editor?.getAttributes("highlight").color || "#FFFFFFFF";

  const onChange = (color: ColorResult) => {
    editor?.chain().focus().setHighlight({color:color.hex}).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-300">
          <HighlighterIcon className="size-4"/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-0 p-0">
        <SketchPicker color={value} onChangeComplete={onChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TextColorButton = () => {
  const { editor } = useEditorStore();

  const value =
    editor?.getAttributes("textStyle").color || "#000000";

  const onChange = (color: ColorResult) => {
    editor?.chain().focus().setColor(color.hex).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-300">
          <span className="text-xs leading-none">A</span>
          <div
            className="h-0.5 w-4 mt-0.5"
            style={{ backgroundColor: value }}/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-0 p-0">
        <SketchPicker color={value} onChangeComplete={onChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
const HeadingLevelButton = () => {
  const { editor } = useEditorStore();

  const headings = [
    { label: "Normal text", value: 0, fontSize: "16px" },
    { label: "Heading 1", value: 1, fontSize: "32px" },
    { label: "Heading 2", value: 2, fontSize: "24px" },
    { label: "Heading 3", value: 3, fontSize: "20px" },
    { label: "Heading 4", value: 4, fontSize: "18px" },
    { label: "Heading 5", value: 5, fontSize: "16px" },
  ] as const;

  const getCurrentHeading = () => {
    for (let level = 1 ; level <= 5; level++) {
      if (editor?.isActive("heading", { level })) {
        return `Heading ${level}`;
      }
    }
    return "Normal text";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 w-[140px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 text-sm">
          <span className="truncate">{getCurrentHeading()}</span>
          <ChevronDownIcon className="ml-2 size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 bg-white border border-neutral-200 shadow-md">
        {headings.map(({ label, value, fontSize }) => (
          <button
            key={value}
            style={{ fontSize }}
            onClick={() => {
              if (value === 0) {
                editor?.chain().focus().setParagraph().run();
              } else {
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: value as Level })
                  .run();
              }
            }}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 text-left",
              (value === 0 && !editor?.isActive("heading")) ||
                editor?.isActive("heading", {
                  level: value as Level,
                })
                ? "bg-neutral-200/80"
                : ""
            )}
          >
            {label}
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontFamilyButton=()=>{
  const {editor}=useEditorStore();

  const fonts = [
  { label: "Default", value: "" },

  // 🔹 System / UI
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },

  // 🔹 Modern Sans (Google Fonts)
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Nunito", value: "Nunito, sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Ubuntu", value: "Ubuntu, sans-serif" },
  { label: "Raleway", value: "Raleway, sans-serif" },

  // 🔹 Serif (classic / editorial)
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Libre Baskerville", value: "'Libre Baskerville', serif" },
  { label: "PT Serif", value: "'PT Serif', serif" },

  // 🔹 Monospace (coding)
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Fira Code", value: "'Fira Code', monospace" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Source Code Pro", value: "'Source Code Pro', monospace" },
  { label: "IBM Plex Mono", value: "'IBM Plex Mono', monospace" },

  // 🔹 Display / Creative
  { label: "Pacifico", value: "Pacifico, cursive" },
  { label: "Lobster", value: "Lobster, cursive" },
  { label: "Dancing Script", value: "'Dancing Script', cursive" },
  { label: "Caveat", value: "Caveat, cursive" },
  { label: "Satisfy", value: "Satisfy, cursive" },

  // 🔹 Premium / UI nice fonts
  { label: "Work Sans", value: "'Work Sans', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Outfit", value: "Outfit, sans-serif" },
];
  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <button className="h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
          <span className="truncate">
            {editor?.getAttributes('textStyle').fontFamily || "Arial"}
          </span>
          <ChevronDownIcon className="ml-2 size-4 shrink-0 "/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 bg-white text-black border border-neutral-200 shadow-md">
        {fonts.map(({label,value})=>(
          <button onClick={()=>editor?.chain().focus().setFontFamily(value).run()} key={value} className={cn("flex items-center gap-x-2 px-2 py-1  rounded-sm hover:bg-neutral-200/80",
            editor?.getAttributes("textStyle").fontFamily==value && "bg-neutral-200/80")}
            style={{fontFamily:value}}
            >
              <span className="text-sm ">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
interface ToolbarButtonProps{
  onClick?:()=>void;
  isActive?:boolean;
  icon:LucideIcon;
};
const ToolbarButton=({onClick,isActive,icon:Icon}:ToolbarButtonProps)=>{
  return (
    <button onClick={onClick} className={cn(
      "text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-300",
      isActive && "bg-neutral-400"
    )}>
      <Icon className="size-4 "/>
    </button>
  )

}
const Toolbar = () => {
  const {editor}=useEditorStore()
  const sections:{label:string , icon:LucideIcon , onClick:()=>void, isActive?:boolean}[][]=[
    [
      {label:"Undo",
        icon:Undo2Icon,
        onClick:()=>editor?.chain().focus().undo().run(),
      },
      {label:"Redo",
        icon:Redo2Icon,
        onClick:()=>editor?.chain().focus().redo().run(),
      },
      {label:"Print",
        icon:PrinterIcon,
        onClick:()=>window.print(),
      },
      {label:"Spell Check",
        icon:SpellCheckIcon,
        onClick:()=>{
          const current=editor?.view.dom.getAttribute("spellcheck");
          editor?.view.dom.setAttribute("spellcheck",current==="false"?"true":"false")
        },
      }
    ],
    [
      {
        label:"Bold",
        icon:BoldIcon,
        isActive:editor?.isActive("bold"),
        onClick:()=>editor?.chain().focus().toggleBold().run()
      },
      {
        label:"Italic",
        icon:ItalicIcon,
        isActive:editor?.isActive("italic"),
        onClick:()=>editor?.chain().focus().toggleItalic().run()
      },
      {
        label:"Underline",
        icon:UnderlineIcon,
        isActive:editor?.isActive("underline"),
        onClick:()=>editor?.chain().focus().toggleUnderline().run()
      }
    ],
    [
      {
        label:"Comment",
        icon:MessageSquarePlusIcon,
        onClick:()=>console.log("comment"),
        isActive:false,
      },
      {
        label:"Todo List",
        icon:ListTodoIcon,
        onClick:()=>editor?.chain().focus().toggleTaskList().run(),
        isActive:editor?.isActive("taskList"),
      },
      {
        label:"Remove Formatting",
        icon:RemoveFormattingIcon,
        onClick:()=>editor?.chain().focus().unsetAllMarks().run(),
      },
    ]
  ]
  return (
    <div className="bg-[#F1F4F9] px-2.5 py-0.5 rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto ">
      {sections[0].map((item)=> (
        <ToolbarButton key={item.label}{...item}/>
      ))}
      <Separator orientation="vertical" className="h-6 bg-gray-300 "/>
      {/*Font Family */}
      <FontFamilyButton/>
      <Separator orientation="vertical" className="h-6 bg-gray-300 "/>
      {/*Heading */}
      <HeadingLevelButton/>
      <Separator orientation="vertical" className="h-6 bg-gray-300 "/>
      {/*Font Size*/}
      <Separator orientation="vertical" className="h-6 bg-gray-300 "/>
      {sections[1].map((item)=>(
        <ToolbarButton key={item.label}{...item}/>
      ))}
      {/*Text Color*/}
      <TextColorButton />
      {/*Highlight Color*/}
      <HighlightColorButton/>
      <Separator orientation="vertical" className="h-6 bg-gray-300 "/>
      {/*Link*/}
      <LinkButton/>
      {/*Image*/}
      <ImageButton/>
      {/*Align*/}
      <AlignButton/>
      {/*Line Height*/}
      {/*List*/}
      <ListButton />
      {sections[2].map((item)=>(
        <ToolbarButton key={item.label}{...item}/>
      ))}
      
    </div>
  )
}

export default Toolbar
