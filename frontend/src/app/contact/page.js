import ContactPageView from "@/components/contact/ContactPageView";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Contact Us | Tech Learning Platform",
  description: "Get in touch with the Tech Learning Platform team.",
};

export default function ContactPage() {
  return (
    <>
      <ContactPageView />
      <Footer className="mt-0" />
    </>
  );
}
