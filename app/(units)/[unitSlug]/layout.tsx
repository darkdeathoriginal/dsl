// app/(units)/[unitSlug]/layout.tsx
import { ReactNode } from 'react';
import { getSectionsForUnit } from '@/lib/content'; // Adjust path
import { UnitSidebarNav } from '@/components/UnitSidebarNav'; // Adjust path

interface UnitLayoutProps {
  children: ReactNode;
  params: Promise<{
    unitSlug: string;
  }>;
}

export default async function UnitLayout({ children, params }: UnitLayoutProps) {
  // Destructure unitSlug from params
  const { unitSlug } = await params; // <--- KEY CHANGE: Destructure here

  const sections = await getSectionsForUnit(unitSlug); // Use the destructured variable

  // You can keep this check or modify it
  // if (sections.length === 0 && unitSlug !== 'example-empty-unit') {
  //   notFound();
  // }

  const unitTitle = unitSlug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-64 lg:w-72 md:sticky md:top-16 md:max-h-[calc(100vh-4rem-env(safe-area-inset-bottom))]">
        <div className="py-6 pr-6 md:py-8 md:pr-0">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
                {unitTitle} Sections
            </h2>
            {/* Use the destructured unitSlug when passing as a prop */}
            <UnitSidebarNav unitSlug={unitSlug} sections={sections} />
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  // This should list all your unit slugs.
  // For now, hardcoding, but ideally, derive from `content` directory
  // Example:
  // const contentLib = await import('@/lib/content'); // Dynamic import for server context
  // const allUnits = await contentLib.getUnitNavigationStructure();
  // return allUnits.map(unit => ({ unitSlug: unit.slug }));

  return [
    { unitSlug: 'ds-unit-1' },
    { unitSlug: 'ds-unit-2' },
    { unitSlug: 'ds-unit-3' },
  ];
}