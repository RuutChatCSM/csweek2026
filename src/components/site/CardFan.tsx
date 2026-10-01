"use client";

import Link from "next/link";
import { CardPreview } from "@/components/card/CardPreview";
import type { CardData } from "@/lib/types";

const SAMPLES: CardData[] = [
  {
    mode: "other",
    name: "Zainab Bello",
    role: "Customer Success Lead",
    org: "Kuda",
    message: "You turn every frustrated customer into a fan. We see it, and we're grateful.",
    photo: "",
    theme: "ruut",
    senderName: "The CX team",
  },
  {
    mode: "other",
    name: "Daniel Mensah",
    role: "Support Engineer",
    org: "Flutterwave",
    message: "Thank you for the late nights, the patience and the fixes nobody saw.",
    photo: "",
    theme: "lime",
    senderName: "Efua",
  },
  {
    mode: "other",
    name: "Amara Okafor",
    role: "Senior Support Specialist",
    org: "Paystack",
    message:
      "Thank you for always showing up for our customers and making every interaction feel human. Happy Customer Service Week!",
    photo: "",
    theme: "signal",
    senderName: "Tunde",
  },
  {
    mode: "self",
    name: "Chidi Nwosu",
    role: "Head of Support",
    org: "Moniepoint",
    message: "I grew a team of 4 into 20 and we cut first-response time in half. Proud of us.",
    photo: "",
    theme: "night",
    senderName: "",
  },
  {
    mode: "other",
    name: "Lerato Dube",
    role: "Contact Centre Agent",
    org: "MTN",
    message: "Your calm on the toughest calls makes the whole floor better.",
    photo: "",
    theme: "coral",
    senderName: "Sipho",
  },
];

const LAYOUT = [
  { r: -14, x: -88, y: 46, z: 1 },
  { r: -7, x: -44, y: 14, z: 2 },
  { r: 0, x: 0, y: 0, z: 3 },
  { r: 7, x: 44, y: 14, z: 2 },
  { r: 14, x: 88, y: 46, z: 1 },
];

export function CardFan() {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-5xl sm:h-[440px]">
      {SAMPLES.map((card, i) => {
        const l = LAYOUT[i];
        return (
          <Link
            key={card.name}
            href={card.mode === "self" ? "/create?mode=self" : "/create"}
            aria-label={`Make a card like ${card.name}'s`}
            className={`group absolute left-1/2 top-0 w-[46vw] max-w-[300px] sm:w-[28vw] ${i === 0 || i === 4 ? "hidden sm:block" : ""}`}
            style={{
              zIndex: l.z,
              transform: `translateX(calc(-50% + ${l.x}%)) translateY(${l.y}px)`,
            }}
          >
            <div
              className="rise transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-6 group-hover:scale-[1.04]"
              style={{ ["--r" as string]: `${l.r}deg`, transform: `rotate(${l.r}deg)`, animationDelay: `${600 + i * 90}ms` }}
            >
              <CardPreview data={card} className="shadow-[0_30px_60px_-20px_rgba(22,22,26,.45)]" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
