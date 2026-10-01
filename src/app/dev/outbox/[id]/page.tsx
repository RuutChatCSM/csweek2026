import { notFound } from "next/navigation";
import { convertConfigured } from "@/lib/email/convert";
import { getOutboxEmail } from "@/lib/store";

/** Development-only preview of emails that would be delivered through Convert by Ruut. */
export default async function OutboxPage({ params }: PageProps<"/dev/outbox/[id]">) {
  if (process.env.NODE_ENV === "production" || convertConfigured) notFound();
  const { id } = await params;
  const email = await getOutboxEmail(id);
  if (!email) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 rounded-2xl bg-road px-5 py-4 text-sm">
        <p className="font-bold">Dev outbox · this email was not sent</p>
        <p className="mt-1">
          Set <code>CONVERT_API_URL</code> and <code>CONVERT_API_KEY</code> to deliver through Convert by Ruut.
        </p>
        <p className="mt-2">
          <strong>To:</strong> {email.to}
          <br />
          <strong>Subject:</strong> {email.subject}
        </p>
      </div>
      <iframe title="Email preview" srcDoc={email.html} className="h-[1400px] w-full rounded-2xl border border-ink/10 bg-white" />
    </main>
  );
}
