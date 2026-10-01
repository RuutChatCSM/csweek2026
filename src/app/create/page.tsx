import type { Metadata } from "next";
import { CreateFlow } from "@/components/create/CreateFlow";

export const metadata: Metadata = {
  title: "Make a CS Week card · The Extra Mile",
};

export default async function CreatePage({ searchParams }: PageProps<"/create">) {
  const sp = await searchParams;
  return <CreateFlow initialMode={sp.mode === "self" ? "self" : "other"} fromEmail={sp.ref === "email"} />;
}
