import type { FeedItem } from "./types";

/**
 * Sample celebrations (fictional people and organisations) that keep the hero, the reveal fan
 * and the wall feeling full until enough real celebrations arrive. Tagged "Example" on the wall.
 * Photos: free Magnific (formerly Freepik) stock — see public/people/CREDITS.md.
 */
const E = (
  file: string,
  name: string,
  role: string,
  org: string,
  message: string,
  senderName: string,
  theme: FeedItem["theme"],
  photoPosition = "50% 30%",
): FeedItem => ({
  id: `example-${file}`,
  name,
  role,
  org,
  message,
  senderName,
  theme,
  mode: senderName ? "other" : "self",
  photoUrl: `/people/${file}.jpg`,
  photoPosition,
  createdAt: "2025-01-01T00:00:00.000Z",
  example: true,
});

export const EXAMPLES: FeedItem[] = [
  E("m02", "Adaeze Okafor", "Customer Success Manager", "Savvy Savings", "You remember every customer's story. That's rare, and it matters.", "Tunde", "ruut", "65% 30%"),
  E("m01", "Kelechi Nwankwo", "Support Agent", "Tidepay", "Every ticket you touch ends with a thank-you. Happy CS Week!", "Chioma", "coral"),
  E("m11", "Zainab Bello", "Customer Experience Analyst", "Swiftcart", "You make the hard conversations look easy. Thank you for every extra mile.", "Yusuf", "signal"),
  E("m09", "Kwame Asante", "Head of Customer Experience", "Kora Finance", "You built a team that listens first. Customers feel it in every reply.", "Ama", "lime"),
  E("m16", "Ifeoma Chukwu", "Customer Support Lead", "Lagoon Bank", "You turn every frustrated customer into a fan. We see it, and we're grateful.", "The CX team", "night"),
  E("m13", "Emeka Obi", "Customer Success Lead", "Fernpay", "Your empathy is our best product feature. Happy Customer Service Week!", "Seun", "ruut", "70% 30%"),
  E("m08", "Ngozi Eze", "Customer Care Officer", "Harbor Bank", "You go the extra mile so often it's basically your commute. Thank you!", "Ike", "coral", "60% 30%"),
  E("m15", "Tobi Adeyemi", "Technical Support", "Gridlink", "The fastest first response on the team, and the kindest. Thank you!", "Hannah", "signal"),
  E("m03", "Sofia Mendes", "Contact Centre Agent", "Brightline", "Your calm on the toughest calls makes the whole floor better. Thank you.", "Lerato", "lime"),
  E("m12", "Femi Olawale", "Escalations Manager", "Summit Trust", "When it's on fire, you're the calm. Thank you for every save this year.", "Bisi", "night"),
  E("m06", "Amaka Ibe", "Voice Support Agent", "Sunwave Telecom", "You make customers smile through a headset. That's a superpower.", "Ravi", "ruut", "55% 30%"),
  E("m10", "Tunde Bakare", "Support Operations", "Crest Bank", "You quietly fixed the process that saves us hours every week. Legend.", "Priya", "coral", "60% 30%"),
  E("m14", "Halima Yusuf", "Help Desk Specialist", "Northwind", "Patient, kind and always solution-first. Thank you for everything.", "Musa", "signal"),
  E("m17", "Yaw Mensah", "Support Engineer", "Marketly", "I closed my 10,000th ticket this year and still love this job.", "", "lime", "75% 30%"),
  E("m18", "Mei Tanaka", "Support Specialist", "Tidepay", "Thank you for always showing up for our customers and making every interaction feel human.", "Daniel", "night", "85% 30%"),
  E("m20", "Rafael Costa", "Community Manager", "Customer Support Hub", "This year I helped 4,000 customers and mentored three new teammates. Proud of that.", "", "ruut"),
  E("m19", "Hannah Weber", "Customer Care Executive", "Meridian Bank", "Thank you for treating every customer like they're your only one.", "Deepa", "coral", "75% 30%"),
];
