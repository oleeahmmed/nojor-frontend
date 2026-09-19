import type { Metadata } from "next";
import { Suspense } from "react";
import { InfoPage, InfoSection } from "@/components/info-page";
import { COMMUNITY } from "@/lib/community";

export const metadata: Metadata = {
  title: "সংশোধন নীতি · Nojor",
  description: "Nojor আর্কাইভে ভুল তথ্য সংশোধন ও অভিযোগের নীতি।",
};

export default function CorrectionsPage() {
  return (
    <Suspense fallback={null}>
      <InfoPage
        activeHref="/corrections"
        eyebrow="Nojor · Corrections"
        title="সংশোধন নীতি"
        lead="ভুল তথ্য থাকলে সংশোধন করা আমাদের দায়িত্ব। স্বচ্ছতা বজায় রেখে কেস আপডেট বা সরানো হয়।"
      >
        <InfoSection title="কখন সংশোধন চাইবেন">
          <ul className="list-disc space-y-2 pl-5">
            <li>ভুল জেলা / উপজেলা / থানা</li>
            <li>ভুল শিরোনাম বা বিভ্রান্তিকর সারসংক্ষেপ</li>
            <li>ভুল আইনি স্ট্যাটাস (যেমন দণ্ডিত দেখানো অথচ খালাস)</li>
            <li>মূল ভিডিও সরানো / ভুল লিংক</li>
            <li>গোপনীয়তা বা নিরাপত্তার গুরুতর ঝুঁকি</li>
          </ul>
        </InfoSection>

        <InfoSection title="কীভাবে অনুরোধ করবেন">
          <p>
            ইমেইলে কেসের লিংক বা স্লাগ, সমস্যা কী, এবং সম্ভব হলে প্রমাণ সূত্র
            পাঠান:
          </p>
          <p>
            <a
              href={`mailto:${COMMUNITY.youtube.email}?subject=${encodeURIComponent("Nojor সংশোধন অনুরোধ")}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {COMMUNITY.youtube.email}
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            বিষয় লাইনে লিখুন: “সংশোধন” + কেসের জেলা বা শিরোনাম। সাধারণত কয়েক
            কর্মদিবসের মধ্যে রিভিউ করা হয়।
          </p>
        </InfoSection>

        <InfoSection title="আমরা কী করতে পারি">
          <ul className="list-disc space-y-2 pl-5">
            <li>তথ্য সংশোধন ও স্ট্যাটাস আপডেট</li>
            <li>সূত্র যোগ / পরিবর্তন</li>
            <li>প্রয়োজনে কেস হাইড বা আর্কাইভ থেকে সরিয়ে রাখা</li>
            <li>স্পষ্ট ভুল হলে পাবলিক নোট (যেখানে প্রযোজ্য)</li>
          </ul>
        </InfoSection>

        <InfoSection title="যা করা হয় না">
          <p>
            শুধু অপছন্দ বা মতবিরোধের কারণে কেস মুছে ফেলা হয় না। বৈধ যাচাইকৃত
            রেকর্ড জনস্বার্থে রাখা হতে পারে — তবে আইনি নির্দেশ বা স্পষ্ট ক্ষতির
            ক্ষেত্রে দ্রুত ব্যবস্থা নেওয়া হয়।
          </p>
        </InfoSection>
      </InfoPage>
    </Suspense>
  );
}
