import React, { useEffect } from 'react';

interface DrawerProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ title, subtitle, onClose, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="drawer" role="dialog" aria-label={title}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">{title}</div>
            {subtitle && <div className="drawer-subtitle">{subtitle}</div>}
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </>
  );
};

export const DrawerSection: React.FC<{ num: string; title: string; children: React.ReactNode }> = ({
  num,
  title,
  children,
}) => (
  <section>
    <div className="drawer-section-title">
      <span className="drawer-section-num">{num}</span>
      {title}
    </div>
    <div className="drawer-section-body">{children}</div>
  </section>
);
