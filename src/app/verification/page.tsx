import type { Metadata } from "next";
import { Suspense } from "react";
import {
  InfoPage,
  InfoSection,
  InfoSteps,
} from "@/components/info-page";

export const metadata: Metadata = {
  title: "কীভাবে যাচাই হয় · Nojor",
  description: "Nojor-এ ক্রাইম ভিডিও কীভাবে যাচাই ও প্রকাশ হয়।",
};

export default function VerificationPage() {
  return (
    <Suspense fallback={null}>
      <InfoPage
        activeHref="/verification"
        eyebrow="Nojor · Verification"
        title="কীভাবে যাচাই হয়"
        lead="প্রতিটি কেস আর্কাইভে যাওয়ার আগে কয়েক ধাপের যাচাই পার করে — যাতে মিথ্যা বা বিভ্রান্তিকর কনটেন্ট কমে।"
      >
        <InfoSteps
          steps={[
            {
              title: "জমা",
              body: "ব্যবহারকারী YouTube বা Facebook-এর পাবলিক ভিডিও লিংক, শিরোনাম, জেলা এবং (ঐচ্ছিক) ক্যাটাগরি দিয়ে জমা দেন।",
            },
            {
              title: "লিংক ও ফরম্যাট চেক",
              body: "শুধু অনুমোদিত প্ল্যাটফর্মের লিংক গ্রহণ হয়। এম্বেড আইডি বের করা যায় কিনা দেখা হয়।",
            },
            {
              title: "মডারেশন",
              body: "টিম দেখে: ভিডিও অ্যাক্সেসযোগ্য কিনা, শিরোনাম মিলে কিনা, লোকেশন যৌক্তিক কিনা, এবং সংবেদনশীল/অবৈধ কনটেন্ট নয় কিনা।",
            },
            {
              title: "প্রকাশ",
              body: "যাচাই পাস করলে কেস পাবলিশ হয় — স্ট্যাটাস, সূত্র ও এলাকা ফিল্টারে দেখা যায়।",
            },
            {
              title: "পরবর্তী আপডেট",
              body: "কর্মকর্তা রিপোর্ট বা যাচাইকৃত সূত্র থেকে আইনি স্ট্যাটাস (তদন্ত, বিচার, দণ্ড ইত্যাদি) আপডেট হতে পারে।",
            },
          ]}
        />

        <InfoSection title="যা আমরা যাচাই করি না">
          <p>
            আমরা আদালত নই — দোষী সাব্যস্ত করি না। ভিডিওতে দেখা ঘটনার পূর্ণ সত্যতা
            সবসময় নিশ্চিত করা সম্ভব নয়। তাই স্ট্যাটাস ও সূত্র আলাদা রাখা হয়,
            এবং ভুল হলে সংশোধনের পথ খোলা থাকে।
          </p>
        </InfoSection>

        <InfoSection title="কমিউনিটি পোস্ট">
          <p>
            সহজ জমার জন্য Facebook গ্রুপ ও YouTube চ্যানেলে পাবলিক পোস্ট করে সেই
            লিংক Create ফর্মে দিতে পারেন। ব্যক্তিগত ভিডিও গ্রহণযোগ্য নয়।
          </p>
        </InfoSection>
      </InfoPage>
    </Suspense>
  );
}
