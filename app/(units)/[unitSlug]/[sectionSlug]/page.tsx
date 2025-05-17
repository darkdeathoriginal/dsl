// app/(units)/[unitSlug]/[sectionSlug]/page.tsx
import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { CodeBlock } from '@/components/CodeBlock'; // Adjust path
import { notFound } from 'next/navigation';
import remarkGfm from 'remark-gfm';
import { Quiz } from '@/components/Quiz';
import { getQuizData, QuizData } from '@/lib/quiz';

const contentDir = path.join(process.cwd(), 'content');

export async function generateStaticParams() {
  const units = fs.readdirSync(contentDir).filter(item => fs.statSync(path.join(contentDir, item)).isDirectory());
  const paramsList: { unitSlug: string; sectionSlug: string }[] = []; // Renamed to avoid conflict

  for (const unit of units) {
    const sections = fs.readdirSync(path.join(contentDir, unit)).filter(file => file.endsWith('.mdx'));
    for (const section of sections) {
      paramsList.push({ // Use renamed variable
        unitSlug: unit,
        sectionSlug: section.replace('.mdx', ''),
      });
    }
  }
  return paramsList; // Use renamed variable
}

interface PageParams { // Define an interface for params for clarity
  unitSlug: string;
  sectionSlug: string;
}


export default async function SectionPage({ params }: { params: PageParams }) {
  const { unitSlug, sectionSlug } = params;

  // Load MDX content
  const filePath = path.join(process.cwd(), 'content', unitSlug, `${sectionSlug}.mdx`);
  if (!fs.existsSync(filePath)) notFound();
  const source = fs.readFileSync(filePath, 'utf8');
  const { content, frontmatter } = await compileMDX<{ title?: string }>({
    source,
    components: { CodeBlock },
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm] } },
  });

  // Load Quiz data (convention: sectionSlug-quiz.json)
  const quizData: QuizData | null = await getQuizData(unitSlug, sectionSlug);

  return (
    <>
      <article className="mdx-content max-w-none py-6">
        {content}
      </article>

      {quizData && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Test Your Knowledge</h2>
          <Quiz quizData={quizData} />
        </div>
      )}
    </>
  );
}

  