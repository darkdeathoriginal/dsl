// lib/content.ts
import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';

export interface SectionMeta {
  slug: string;
  title: string; // You'd get this from frontmatter
  order?: number; // For sorting, derived from filename or frontmatter
}

export interface UnitMeta {
  slug: string;
  title: string; // Could be derived or hardcoded
  sections: SectionMeta[];
}

const contentDirectory = path.join(process.cwd(), 'content');

// Function to get a title from filename (simple version)
function getTitleFromSlug(slug: string): string {
  return slug
    .replace(/^\d+-/, '') // Remove leading numbers like "01-"
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize
}

export async function getUnitNavigationStructure(): Promise<UnitMeta[]> {
  const unitDirs = fs.readdirSync(contentDirectory).filter(item =>
    fs.statSync(path.join(contentDirectory, item)).isDirectory()
  );

  const units: UnitMeta[] = [];

  for (const unitDir of unitDirs) {
    const unitPath = path.join(contentDirectory, unitDir);
    const sectionFiles = fs.readdirSync(unitPath).filter(file => file.endsWith('.mdx'));

    const sections: SectionMeta[] = [];
    for (const sectionFile of sectionFiles) {
      const slug = sectionFile.replace('.mdx', '');
      const filePath = path.join(unitPath, sectionFile);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      
      // Basic frontmatter parsing (could use gray-matter for more robust parsing)
      let title = getTitleFromSlug(slug);
      const frontmatterMatch = fileContents.match(/^---\s*([\s\S]*?)\s*---/);
      if (frontmatterMatch && frontmatterMatch[1]) {
        const fm = frontmatterMatch[1];
        const titleMatch = fm.match(/title:\s*['"]?(.*?)['"]?\s*$/m);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1];
        }
      }
      
      sections.push({
        slug,
        title,
        order: parseInt(slug.split('-')[0]) || undefined, // Simple ordering by filename prefix
      });
    }

    sections.sort((a, b) => (a.order || Infinity) - (b.order || Infinity));

    units.push({
      slug: unitDir,
      title: getTitleFromSlug(unitDir), // Or set a more formal unit title
      sections,
    });
  }
  // Sort units by slug, or add an order property to unit folders
  units.sort((a, b) => a.slug.localeCompare(b.slug));
  return units;
}

export async function getSectionsForUnit(unitSlug: string): Promise<SectionMeta[]> {
  const unitPath = path.join(contentDirectory, unitSlug);
  if (!fs.existsSync(unitPath) || !fs.statSync(unitPath).isDirectory()) {
    return [];
  }
  const sectionFiles = fs.readdirSync(unitPath).filter(file => file.endsWith('.mdx'));
  
  const sections: SectionMeta[] = [];
   for (const sectionFile of sectionFiles) {
      const slug = sectionFile.replace('.mdx', '');
      const filePath = path.join(unitPath, sectionFile);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      
      let title = getTitleFromSlug(slug);
      const frontmatterMatch = fileContents.match(/^---\s*([\s\S]*?)\s*---/);
      if (frontmatterMatch && frontmatterMatch[1]) {
        const fm = frontmatterMatch[1];
        const titleMatch = fm.match(/title:\s*['"]?(.*?)['"]?\s*$/m);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1];
        }
      }
      
      sections.push({
        slug,
        title,
        order: parseInt(slug.split('-')[0]) || undefined,
      });
    }
  sections.sort((a, b) => (a.order || Infinity) - (b.order || Infinity));
  return sections;
}