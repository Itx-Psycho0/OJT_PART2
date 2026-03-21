import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, FileText } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  // Mock recent documents
  const recentDocs = [
    { id: '1', title: 'Getting Started', date: 'Oct 24, 2023' },
    { id: '2', title: 'Project Proposal', date: 'Nov 1, 2023' },
    { id: '3', title: 'Meeting Notes', date: 'Nov 15, 2023' },
  ];

  const createNewDoc = () => {
    const newId = Date.now().toString();
    navigate(`/doc/${newId}`);
  };

  return (
    <div className="home-container animate-fade-in">
      <section className="create-section">
        <div className="section-header">
          <h2>Start a new document</h2>
        </div>
        <div className="new-doc-list">
          <div className="new-doc-card glass" onClick={createNewDoc}>
            <div className="new-doc-icon">
              <Plus size={48} color="#3b82f6" />
            </div>
          </div>
          <span className="new-doc-label">Blank</span>
        </div>
      </section>

      <section className="recent-section">
        <div className="section-header">
          <h2>Recent documents</h2>
        </div>
        <div className="documents-grid">
          {recentDocs.map(doc => (
            <div key={doc.id} className="doc-item glass" onClick={() => navigate(`/doc/${doc.id}`)}>
              <div className="doc-preview">
                <FileText size={48} color="#cbd5e1" strokeWidth={1} />
              </div>
              <div className="doc-info">
                <h4>{doc.title}</h4>
                <div className="doc-meta">
                  <span className="doc-icon"><FileText size={14} color="#3b82f6" /></span>
                  <span className="doc-date">Opened {doc.date}</span>
                  <button className="btn-ghost doc-menu-btn" onClick={(e) => { e.stopPropagation(); }}>
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
