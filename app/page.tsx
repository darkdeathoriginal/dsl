// app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-6 text-center">
        Welcome to the Interactive Data Science Learning Platform
      </h1>
      <p className="mb-8 text-lg text-muted-foreground text-center max-w-2xl">
        Explore Data Science concepts with hands-on Python examples running directly in your browser!
        Select a unit to begin.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>DS Unit 1</CardTitle>
            <CardDescription>Introduction to Data Science, NumPy & Pandas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ds-unit-1/01-what-is-data-science" passHref>
              <Button className="w-full">Start Unit 1</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DS Unit 2</CardTitle>
            <CardDescription>Data Wrangling, Cleaning, and Preparation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ds-unit-2/01-data-handling-large-data" passHref>
                <Button className="w-full">Start Unit 2</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DS Unit 3</CardTitle>
            <CardDescription>Data Visualization with Matplotlib and Seaborn.</CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/ds-unit-3/01-intro-matplotlib" passHref>
                <Button className="w-full">Start Unit 3</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}