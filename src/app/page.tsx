import { connection } from "next/server";
import { HeroReveal } from "@/components/home/HeroReveal";
import { FloatingCTA, HomeFooter, HowItWorks, PoweredBy, ThanksMarquee } from "@/components/home/Sections";
import { SmoothScroll } from "@/components/home/SmoothScroll";
import { Wall } from "@/components/home/Wall";
import { getFeedPage, getShowcase } from "@/lib/feed";

export default async function Home({ searchParams }: PageProps<"/">) {
  await connection(); // always render with the latest celebrations
  const sp = await searchParams;
  const [showcase, wall] = await Promise.all([getShowcase(11), getFeedPage(Number(sp.page ?? 1))]);

  return (
    <SmoothScroll>
      <main className="overflow-x-clip">
        <HeroReveal people={showcase.items} total={showcase.total} gallery={[]} />
        <ThanksMarquee />
        <Wall initial={wall} />
        <HowItWorks />
        <PoweredBy />
        <HomeFooter />
        <FloatingCTA />
      </main>
    </SmoothScroll>
  );
}
