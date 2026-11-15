import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  action,
  icon,
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/80 p-5 sm:p-6 transition-all duration-200 hover:shadow-md ${className}`}>
      {(title || action || icon) && (
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 rounded-xl bg-slate-50 text-emerald-600">{icon}</div>}
            <div>
              {title && <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-normal">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
