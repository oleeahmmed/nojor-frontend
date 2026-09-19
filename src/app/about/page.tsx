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
        eyebrow="Nojor · About"
        title="আমাদের সম্পর্কে"
        lead="Nojor (নজর) একটি যাচাইকৃত ক্রাইম ভিডিও আর্কাইভ — জনগণের দেখা ঘটনা সংরক্ষণ, আইনি অবস্থা ট্র্যাক, এবং স্বচ্ছ তথ্যের জন্য।"
      >
        <InfoSection title="আমরা কী করি">
          <p>
            বাংলাদেশে প্রতিদিন অসংখ্য অপরাধের ভিডিও সামাজিক মাধ্যমে ছড়িয়ে পড়ে —
            কিন্তু অনেক সময় সেগুলো হারিয়ে যায়, বিকৃত হয়, বা কোনো আইনি ফলোআপ
            থাকে না। Nojor সেই শূন্যস্থান পূরণ করে: যাচাইকৃত ভিডিও, স্থান, এবং
            বিচারের অবস্থা এক জায়গায় রাখে।
          </p>
          <p>
            আমরা কোনো সংবাদমাধ্যম নই। আমরা একটি <strong>পাবলিক আর্কাইভ</strong> —
            যাতে নাগরিক, সাংবাদিক ও কর্মকর্তারা একই সূত্র দেখতে পারেন।
          </p>
        </InfoSection>

        <InfoSection title="মূল নীতি">
          <ul className="list-disc space-y-2 pl-5 text-[15px] text-foreground/90">
            <li>শুধু YouTube / Facebook পাবলিক ভিডিও লিংক গ্রহণ</li>
            <li>জেলাসহ লোকেশন বাধ্যতামূলক — মিথ্যা স্থান নয়</li>
            <li>প্রকাশের আগে যাচাই (মডারেশন)</li>
            <li>আইনি স্ট্যাটাস আপডেট — রিপোর্ট থেকে রায় পর্যন্ত</li>
            <li>পরিচয় গোপন রেখে জমা ও টিপ দেওয়ার সুযোগ</li>
          </ul>
        </InfoSection>

        <InfoSection title="কার জন্য">
          <p>
            সাধারণ নাগরিক যারা ঘটনা সংরক্ষণ করতে চান; কর্মকর্তারা যারা এলাকাভিত্তিক
            কেস দেখতে চান; এবং যারা জানতে চান কোন কেসে বিচার হয়েছে আর কোনটিতে
            হয়নি।
          </p>
        </InfoSection>

        <InfoSection title="যোগাযোগ">
          <p>
            সাধারণ প্রশ্ন বা পার্টনারশিপ:{" "}
            <a
              href={`mailto:${COMMUNITY.youtube.email}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {COMMUNITY.youtube.email}
            </a>
          </p>
        </InfoSection>
      </InfoPage>
    </Suspense>
  );
}
