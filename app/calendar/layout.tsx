export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full">
      {children}
    </div>
  );
}
