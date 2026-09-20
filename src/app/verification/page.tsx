import type { Metadata } from "next";
import { Suspense } from "react";
import {
  InfoPage,
  InfoSection,
  InfoSteps,
} from "@/components/info-page";
import { COMMUNITY } from "@/lib/community";

export const metadata: Metadata = {
  title: "কীভাবে যাচাই হয় · Nojor",
  description: "Nojor-এ ক্রাইম ভিডিও কীভাবে যাচাই ও প্রকাশ হয়।",
};

export default function VerificationPage() {
  return (
    <Suspense fallback={null}>
      <InfoPage
        activeHref="/verification"
        title="কীভাবে যাচাই হয়"
        lead="প্রতিটি কেস আর্কাইভে যাওয়ার আগে যাচাই পার করে — মিথ্যা বা বিভ্রান্তিকর কনটেন্ট কমাতে।"
      >
        <InfoSteps
          steps={[
            {
              title: "ইমেইলে জমা",
              body: `YouTube/Facebook পাবলিক লিংক ইমেইলে পাঠান (${COMMUNITY.tips.email})। জেলা ও সংক্ষিপ্ত নোট থাকলে ভালো।`,
            },
            {
              title: "লিংক চেক",
              body: "অনুমোদিত প্ল্যাটফর্ম কিনা, এম্বেড/প্লে করা যায় কিনা দেখা হয়।",
            },
            {
              title: "মডারেশন",
              body: "ভিডিও মিলে কিনা, লোকেশন যৌক্তিক কিনা, সংবেদনশীল/অবৈধ কনটেন্ট নয় কিনা।",
            },
            {
              title: "প্রকাশ",
              body: "পাস করলে কেস পাবলিশ — Case ID, স্ট্যাটাস, সূত্র ও এলাকা ফিল্টারে দেখা যায়।",
            },
            {
              title: "পরবর্তী আপডেট",
              body: "পুলিশ/তদন্ত Case ID সহ ইমেইলে স্ট্যাটাস পাঠালে টিম সাইটে আপডেট করে।",
            },
          ]}
        />

        <InfoSection title="যা আমরা যাচাই করি না">
          <p>
            আমরা আদালত নই — দোষী সাব্যস্ত করি না। ভিডিওর পূর্ণ সত্যতা সবসময়
            নিশ্চিত করা সম্ভব নয়। স্ট্যাটাস ও সূত্র আলাদা রাখা হয়; ভুল হলে
            সংশোধনের পথ খোলা।
          </p>
        </InfoSection>

        <InfoSection title="কেন সাইটে ফর্ম নেই">
          <p>
            স্প্যাম ও হামলা কমাতে পাবলিক সাবমিট ফর্ম বন্ধ। শুধু ইমেইল — টিম হাতে
            যাচাই করে যোগ করে। একই লিংক বারবার পাঠানোর দরকার নেই।
          </p>
        </InfoSection>
      </InfoPage>
    </Suspense>
  );
}
