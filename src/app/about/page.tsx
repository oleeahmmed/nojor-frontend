import type { Metadata } from "next";
import { Suspense } from "react";
import { InfoPage, InfoSection } from "@/components/info-page";
import { COMMUNITY } from "@/lib/community";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে · Nojor",
  description: "Nojor — যাচাইকৃত ক্রাইম ভিডিও আর্কাইভ কেন ও কীভাবে কাজ করে।",
};

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <InfoPage
        activeHref="/about"
        title="আমাদের সম্পর্কে"
        lead="Nojor (নজর) একটি যাচাইকৃত ক্রাইম ভিডিও আর্কাইভ — ঘটনা সংরক্ষণ, আইনি অবস্থা ট্র্যাক, এবং স্বচ্ছ তথ্য এক জায়গায়।"
      >
        <InfoSection title="আমরা কী করি">
          <p>
            বাংলাদেশে অপরাধের ভিডিও সামাজিক মাধ্যমে ছড়িয়ে পড়ে — অনেক সময় হারিয়ে
            যায় বা আইনি ফলোআপ থাকে না। Nojor যাচাইকৃত ভিডিও, স্থান ও বিচারের
            অবস্থা এক আর্কাইভে রাখে।
          </p>
          <p>
            আমরা সংবাদমাধ্যম নই — একটি <strong>পাবলিক আর্কাইভ</strong>, যাতে
            নাগরিক, সাংবাদিক ও কর্মকর্তারা একই সূত্র দেখতে পারেন।
          </p>
        </InfoSection>

        <InfoSection title="মূল নীতি">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>পাবলিক ভিডিও লিংক ইমেইলে পাঠান — সাইটে ফর্ম সাবমিট বন্ধ</li>
            <li>জেলাসহ লোকেশন গুরুত্বপূর্ণ — মিথ্যা স্থান নয়</li>
            <li>প্রকাশের আগে টিম যাচাই (মডারেশন)</li>
            <li>আইনি স্ট্যাটাস — রিপোর্ট থেকে রায় পর্যন্ত</li>
            <li>পরিচয় গোপন রেখে টিপ / সংশোধন ইমেইলে</li>
          </ul>
        </InfoSection>

        <InfoSection title="কার জন্য">
          <p>
            নাগরিক যারা ঘটনা সংরক্ষণ করতে চান; কর্মকর্তারা যারা এলাকাভিত্তিক কেস
            দেখতে চান; এবং যারা জানতে চান কোন কেসে বিচার হয়েছে।
          </p>
        </InfoSection>

        <InfoSection title="যোগাযোগ">
          <p>
            <a
              href={`mailto:${COMMUNITY.team.email}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {COMMUNITY.team.email}
            </a>
          </p>
        </InfoSection>
      </InfoPage>
    </Suspense>
  );
}
