

# Interactive Data Science Learning Platform

Welcome to the Interactive Data Science Learning Platform! This project is a Next.js web application designed to provide an engaging learning experience for Data Science concepts, featuring interactive Python code blocks powered by Pyodide. Users can read course materials (Units 1, 2, and 3 covering Data Science fundamentals, NumPy, Pandas, Matplotlib, and Seaborn) and execute Python code examples directly in their browser.

The UI is built with Shadcn UI and Tailwind CSS for a modern and accessible look and feel.

## Features

-   **Interactive Python Code Blocks:** Execute Python (NumPy, Pandas, Matplotlib, Seaborn) directly in the browser using Pyodide.
-   **Structured Course Units:** Content organized into logical units and sections.
    -   **Unit 1:** Foundations of Data Science, NumPy, Pandas.
    -   **Unit 2:** Data Wrangling, Cleaning, and Preparation.
    -   **Unit 3:** Data Visualization with Matplotlib and Seaborn.
-   **MDX Powered Content:** Course materials written in MDX for a rich blend of text and interactive components.
-   **Responsive Design:** Modern UI built with Next.js (App Router), Shadcn UI, and Tailwind CSS.
-   **Dark Mode Support:** Theme toggle for user preference.
-   **Dynamic Navigation:** Sidebar navigation for easy access to different sections within each unit.
-   **Automated Pyodide Setup:** Pyodide distribution is automatically downloaded and set up during project installation.

## Tech Stack

-   **Frontend Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **In-Browser Python:** [Pyodide](https://pyodide.org/)
-   **Content:** [MDX](https://mdxjs.com/)
-   **Language:** TypeScript
-   **Package Manager:** npm (or yarn)

## Project Structure (Illustrative)
```
/my-ds-learning-app
├── app/                      # Next.js App Router (pages, layouts)
│   ├── (units)/              # Group for unit-specific layouts
│   │   ├── [unitSlug]/
│   │   │   ├── [sectionSlug]/
│   │   │   │   └── page.tsx  # Renders individual MDX section
│   │   │   └── layout.tsx  # Unit-specific layout (e.g., sidebar)
│   │   └── layout.tsx      # Shared layout for all unit groups
│   ├── globals.css
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── CodeBlock.tsx       # Interactive Python code execution component
│   ├── PyodideProvider.tsx # Context for managing Pyodide instance
│   ├── UnitSidebarNav.tsx  # Navigation for unit sections
│   └── ThemeToggle.tsx     # Dark/Light mode toggle
├── content/                # Course materials in MDX format
│   ├── ds-unit-1/
│   ├── ds-unit-2/
│   └── ds-unit-3/
├── lib/
│   ├── pyodide.ts          # Pyodide initialization logic
│   ├── content.ts          # Helpers for fetching content structure
│   └── utils.ts            # Shadcn UI utility
├── public/                 # Static assets
│   └── pyodide/            # Pyodide distribution (auto-downloaded)
├── scripts/
│   └── setup-pyodide.js    # Script to download and extract Pyodide
├── next.config.mjs         # Next.js configuration (with MDX)
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.mjs      # PostCSS configuration (usually auto-generated)
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) (v8.x or later) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/darkdeathoriginal/dsl.git
    cd dsl
    ```

2.  **Install dependencies:**
    This command will also trigger the `postinstall` script to download and set up Pyodide. This step might take a few minutes due to the Pyodide download.
    ```bash
    npm install
    # or
    # yarn install
    ```
    If the `postinstall` script fails (e.g., due to network issues), you can try running it manually:
    ```bash
    node ./scripts/setup-pyodide.js
    ```

3.  **Initialize Shadcn UI (if not already configured in the cloned repo):**
    If you're setting up from scratch based on these instructions, you'd run:
    ```bash
    npx shadci@latest init
    ```
    And then add components as needed:
    ```bash
    npx shadcni@latest add button card textarea alert navigation-menu sheet dropdown-menu ...
    ```

### Running the Development Server

Start the Next.js development server:
```bash
npm run dev
# or
# yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The first time you load a page with a `<CodeBlock>`, Pyodide will initialize in your browser, which might take a few moments. Subsequent loads or code executions will be faster.

### Building for Production

To create an optimized production build:
```bash
npm run build
# or
# yarn build
```

To run the production build locally:
```bash
npm run start
# or
# yarn start
```

## Content Management

-   Course content is located in the `content/` directory.
-   Each unit has its own subdirectory (e.g., `content/ds-unit-1/`).
-   Each section within a unit is an `.mdx` file (e.g., `01-what-is-data-science.mdx`).
-   Files are typically prefixed with numbers for ordering in the navigation.
-   Frontmatter (e.g., `title`) can be used at the top of MDX files:
    ```mdx
    ---
    title: My Section Title
    ---

    # Actual Content Starts Here
    ```
-   Interactive code examples are embedded using the custom `<CodeBlock>` component:
    ```mdx
    import { CodeBlock } from '@/components/CodeBlock';

    <CodeBlock
      initialCode={`print("Hello from Pyodide!")\nimport numpy as np\nprint(np.array([1,2,3]))`}
    />

    <CodeBlock
      isPlot={true}
      initialCode={`import matplotlib.pyplot as plt\nplt.plot([1,2,3],[1,4,9])\nplt.title("My Plot")`}
    />
    ```

## Pyodide Setup

-   The Pyodide distribution is downloaded and extracted into the `public/pyodide/` directory by the `postinstall` script (`scripts/setup-pyodide.js`).
-   The version of Pyodide to download is configured in `scripts/setup-pyodide.js`.
-   The `public/pyodide/` directory is included in `.gitignore` as it's managed by the setup script.
-   The `PyodideProvider.tsx` component handles the lazy loading and initialization of Pyodide in the browser.

## Linting and Formatting

-   This project uses ESLint for linting and Prettier (often integrated with ESLint or run separately) for code formatting.
-   Run linters:
    ```bash
    npm run lint
    ```

## Contributing

[Optional: Add guidelines for contributing if this is an open project or for a team.]
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

[Optional: Specify a license, e.g., MIT License]
Distributed under the MIT License. See `LICENSE` file for more information.

## Acknowledgements

-   [Pyodide Team](https://pyodide.org/en/stable/about/team.html)
-   [Next.js Team](https://nextjs.org/)
-   [Shadcn](https://github.com/shadcn)
-   [Tailwind Labs](https://tailwindcss.com/)
-   Authors of the Data Science course materials.

---