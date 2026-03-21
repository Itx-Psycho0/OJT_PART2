import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { Share, Star, MessageSquare } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import './Editor.css';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled document');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save simulation
  useEffect(() => {
    if (content) {
      setIsSaving(true);
      const timer = setTimeout(() => setIsSaving(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [content, title]);

  // Toolbar configuration for Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }, { 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  return (
    <div className="editor-layout animate-fade-in">
      <div className="editor-header glass">
        <div className="header-left">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <input 
              type="text" 
              className="doc-title-input" 
              value={title} 
              onChange={handleTitleChange} 
            />
          </div>
          <div className="doc-menu">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Insert</span>
            <span>Format</span>
            <span>Tools</span>
            <span>Extensions</span>
            <span>Help</span>
            <span style={{color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginLeft: '12px', fontSize: '0.8rem'}}>
              {isSaving ? 'Saving...' : 'Saved to Cloud'}
            </span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-ghost icon-btn"><MessageSquare size={20} /></button>
          <button className="btn btn-ghost icon-btn"><Star size={20} /></button>
          <button className="btn btn-primary share-btn">
            <Share size={18} />
            Share
          </button>
        </div>
      </div>
      
      <div className="editor-container">
        <div className="editor-page glass">
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            modules={modules}
            placeholder="Type your text here..."
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
