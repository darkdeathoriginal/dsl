// components/UnitSidebarNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // from Shadcn
import { SectionMeta } from '@/lib/content'; // Adjust path if needed

interface UnitSidebarNavProps {
  unitSlug: string;
  sections: SectionMeta[];
}

export function UnitSidebarNav({ unitSlug, sections }: UnitSidebarNavProps) {
  const pathname = usePathname();

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-8rem)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <nav className="flex flex-col space-y-1">
        {sections.map((section) => (
          <Link
            key={section.slug}
            href={`/${unitSlug}/${section.slug}`}
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              pathname === `/${unitSlug}/${section.slug}` ? 'bg-accent text-accent-foreground' : 'transparent'
            )}
          >
            <span>{section.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}