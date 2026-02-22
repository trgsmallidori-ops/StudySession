import JsonLd from "./JsonLd";
import type { Course } from "@/lib/database.types";

function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
  return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
}

export default function CoursesJsonLd({
  courses,
}: {
  courses: (Course & { creator?: { full_name?: string } })[];
}) {
  const baseUrl = getBaseUrl();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "StudySession Online Courses",
    description:
      "Gamified online courses with XP, achievements, and progress tracking. Learn and level up.",
    numberOfItems: courses.length,
    itemListElement: courses.slice(0, 20).map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.title,
        description: course.description || `Gamified course: ${course.title}`,
        url: `${baseUrl}/learn/${course.id}`,
        provider: {
          "@type": "Organization",
          name: "StudySession",
        },
        educationalLevel: course.difficulty,
        timeRequired: `P${course.duration_days}D`,
      },
    })),
  };

  return <JsonLd data={itemList} />;
}
