import PaymentVerificationView from "@/components/payment/PaymentVerificationView";

export default async function PaymentVerificationByReferencePage({ params }) {
  const resolvedParams = await params;

  return <PaymentVerificationView initialTxRef={resolvedParams?.txRef || ""} />;
}
