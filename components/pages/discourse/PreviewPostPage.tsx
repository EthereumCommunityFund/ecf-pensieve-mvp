'use client';

import { useRouter } from 'next/navigation';

import { PreviewPost } from './PreviewPost';
import { discourseTopicOptions } from './topicOptions';

export default function PreviewPostPage() {
  const router = useRouter();
  const topic = discourseTopicOptions[0];
  const previewContent = `
    <p>Okay, serious question because my brain is melting from crypto jargon overload.</p>
    <p>Every time I search “What is Ethereum” I get 18 paragraphs about smart contracts, decentralized networks, blockchain scalability, zk-roll-whatevers, and at no point does anyone just say straight up what Ethereum is trying to do in the world.</p>
    <p>Like… what’s the mission here?</p>
    <p>Is the point to replace banks? Become some world computer? Let people trade cartoon cats for six figures without regulation? All of the above?? None???</p>
    <p>If crypto is going to “change everything” like the hype suggests, shouldn’t there be one clear sentence somewhere? Something like:</p>
    <p>“Ethereum exists to ______.”</p>
  `;

  return (
    <div className="flex min-h-screen w-full flex-col gap-8 bg-[#f6f4f1] px-4 pb-20 pt-10">
      <PreviewPost
        onBack={() => router.back()}
        backLabel="Back"
        headerLabel="You are previewing your post"
        title="What in the actual..is Ethereum’s Mission?"
        author="Username"
        timeAgo="a week ago"
        contentHtml={previewContent}
        tags={['WTF', 'Ethereum']}
        categoryLabel={topic.label}
      />
    </div>
  );
}
