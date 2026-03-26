import * as React from 'react';
import { cn } from '@/lib/utils';

export function Title({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn("text-2xl font-bold tracking-tight text-slate-900", className)} {...props}>
      {children}
    </h1>
  );
}
