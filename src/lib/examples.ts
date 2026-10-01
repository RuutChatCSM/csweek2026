import type { FeedItem } from "./types";

/**
 * Sample celebrations (fictional people and organisations, Unsplash portraits in /public/people).
 * They fill the hero and the reveal fan until enough real celebrations exist,
 * and are clearly tagged "Example" on the wall.
 */
const E = (
  n: number,
  name: string,
  role: string,
  org: string,
  message: string,
  senderName: string,
  theme: FeedItem["theme"],
): FeedItem => ({
  id: `example-${n}`,
  name,
  role,
  org,
  message,
  senderName,
  theme,
  mode: senderName ? "other" : "self",
  photoUrl: `/people/p${String(n).padStart(2, "0")}.jpg`,
  createdAt: "2026-10-01T00:00:00.000Z",
  example: true,
});

export const EXAMPLES: FeedItem[] = [
  E(11, "Ifeoma Chukwu", "Customer Support Lead", "Lagoon Bank", "You turn every frustrated customer into a fan. We see it, and we're grateful.", "The CX team", "ruut"),
  E(1, "Mei Tanaka", "Support Specialist", "Tidepay", "Thank you for always showing up for our customers and making every interaction feel human.", "Daniel", "coral"),
  E(20, "Kwame Asante", "Head of Customer Experience", "Kora Finance", "You built a team that listens first. Customers feel it in every reply.", "Ama", "signal"),
  E(6, "Sofia Reyes", "Contact Centre Agent", "Brightline", "Your calm on the toughest calls makes the whole floor better. Thank you.", "Lerato", "lime"),
  E(12, "Adaeze Okafor", "Customer Success Manager", "Savvy Savings", "You remember every customer's story. That's rare, and it matters.", "Tunde", "ruut"),
  E(9, "Marcus Hale", "Senior Support Engineer", "Ruut", "Thank you for the late nights, the patience and the fixes nobody saw.", "Efua", "night"),
  E(16, "Tobi Adeyemi", "Support Agent", "Nestegg", "Every ticket you touch ends with a thank-you. Happy CS Week!", "Chioma", "coral"),
  E(14, "Zainab Bello", "Customer Experience Analyst", "Swiftcart", "You make the hard conversations look easy. Thank you for every extra mile.", "Yusuf", "signal"),
  E(8, "Rafael Costa", "Community Manager", "Customer Support Hub", "This year I helped 4,000 customers and mentored three new teammates. Proud of that.", "", "lime"),
  E(17, "Grace Mensah", "Support Team Lead", "Sunwave Telecom", "Customers remember how you made them feel. Thank you for making them feel heard.", "Kofi", "ruut"),
  E(10, "Leo Park", "Technical Support", "Gridlink", "The fastest first response on the team, and the kindest. Thank you!", "Hannah", "night"),
  E(13, "Ngozi Eze", "Customer Care Officer", "Harbor Bank", "You go the extra mile so often it's basically your commute. Thank you!", "Ike", "coral"),
  E(22, "Amara Nwosu", "Chat Support Agent", "Marketly", "I kept showing up, even on the hard days, and I'm proud of every customer I helped.", "", "signal"),
  E(3, "Arjun Mehta", "Support Operations", "Crest Bank", "You quietly fixed the process that saves us hours every week. Legend.", "Priya", "lime"),
  E(18, "Emeka Obi", "Customer Success Lead", "Fernpay", "Your empathy is our best product feature. Happy Customer Service Week!", "Seun", "ruut"),
  E(21, "Halima Yusuf", "Help Desk Specialist", "Northwind", "Patient, kind and always solution-first. Thank you for everything.", "Musa", "night"),
  E(19, "Femi Olawale", "Escalations Manager", "Summit Trust", "When it's on fire, you're the calm. Thank you for every save this year.", "Bisi", "signal"),
  E(4, "Priya Nair", "Voice Support Agent", "Skyline Mobile", "You make customers smile through a headset. That's a superpower.", "Ravi", "coral"),
  E(15, "Rohan Kapoor", "Support Engineer", "Tidepay", "I closed my 10,000th ticket this year and still love this job.", "", "ruut"),
  E(7, "Ananya Rao", "Customer Care Executive", "Meridian Bank", "Thank you for treating every customer like they're your only one.", "Deepa", "lime"),
];


