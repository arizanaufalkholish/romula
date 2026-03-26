import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Title } from '@/components/ui/Title';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, actionText, onAction, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <Title>{title}</Title>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center space-x-2">
        {children}
        {actionText && onAction && (
          <Button onClick={onAction} className="shrink-0">
            <Plus size={16} className="mr-2" />
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
