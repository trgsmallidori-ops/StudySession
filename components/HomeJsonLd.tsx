import JsonLd from "./JsonLd";

export default function HomeJsonLd() {
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is StudySession?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "StudySession is an AI-powered learning platform that helps students organize their syllabus, build smart study schedules, and take gamified online courses with XP and achievements.",
        },
      },
      {
        "@type": "Question",
        name: "How does the AI calendar work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload your course outline (PDF or Word) and our AI extracts tests, assignments, and class schedules. Events are color-coded and organized automatically.",
        },
      },
      {
        "@type": "Question",
        name: "What are online courses on StudySession?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "StudySession offers gamified online courses where you earn XP, unlock achievements, and track your progress. Complete modules, ace quizzes, and level up your learning.",
        },
      },
      {
        "@type": "Question",
        name: "Can I create a study schedule from my syllabus?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Upload your course syllabus and our AI parses it to create a complete calendar with due dates, exams, and class times. Perfect for academic scheduling.",
        },
      },
    ],
  };

  return <JsonLd data={faqPage} />;
}
