/** Community + contact — public tips vs official access. */
export const COMMUNITY = {
  facebookGroup: {
    name: "Nojor Crime Archive",
    url: "https://www.facebook.com/groups/nojor.crime.archive.demo",
    hint: "গ্রুপে জয়েন করে পাবলিক ভিডিও পোস্ট করুন",
  },
  youtube: {
    channelName: "Nojor Archive",
    channelUrl: "https://www.youtube.com/@NojorArchiveDemo",
    /** @deprecated use COMMUNITY.tips.email */
    email: "tips.nojor@gmail.com",
    hint: "চ্যানেলে যোগ দিন বা ইমেইলে ভিডিও পাঠান",
  },
  /** জনগণ → ভিডিও পাঠানো */
  tips: {
    email: "tips.nojor@gmail.com",
    label: "ভিডিও পাঠান",
    subject: "ভিডিও জমা — নজর",
  },
  /** পুলিশ / তদন্ত কর্মকর্তা → অ্যাক্সেস */
  official: {
    email: "access.nojor@gmail.com",
    label: "অফিসিয়াল অ্যাক্সেস",
    subject: "অফিসিয়াল অ্যাক্সেস অনুরোধ — নজর তদন্ত",
  },
  /** নন-প্রফিট সহায়তা / ডোনেশন */
  donation: {
    email: "nojorhelp@gmail.com",
    label: "ডোনেশন / সহায়তা",
    subject: "নজর — ডোনেশন / সহায়তা (গোপনীয়)",
  },
  sampleLinks: {
    youtube: "https://www.youtube.com/watch?v=yyHikN-rvjM",
    facebook: "https://www.facebook.com/facebook/videos/10153231379946729/",
  },
} as const;
