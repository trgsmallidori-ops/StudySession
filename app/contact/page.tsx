import ContactForm from './ContactForm';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-foreground/70 mb-12">
        Have a question or feedback? We&apos;d love to hear from you.
      </p>
      <ContactForm />
    </div>
  );
}
