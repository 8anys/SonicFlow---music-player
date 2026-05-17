import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function SectionHeader({ title, linkTo, linkLabel = 'See all' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          {linkLabel} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}