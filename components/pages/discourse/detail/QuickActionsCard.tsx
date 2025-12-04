'use client';

import { Button } from '@/components/base';

import { QuickAction } from '../common/threadData';

type QuickActionsCardProps = {
  actions?: QuickAction[];
  onUpvotePost?: () => void;
  onLeaveComment?: () => void;
  onLeaveSentiment?: () => void;
  onAnswerComplaint?: () => void;
};

export function QuickActionsCard({
  onUpvotePost,
  onLeaveComment,
  onLeaveSentiment,
  onAnswerComplaint,
}: QuickActionsCardProps) {
  return (
    <section className="rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <h3 className="text-[14px] font-semibold text-black">
        How to participate?
      </h3>

      <div className="mt-[10px] space-y-[14px]">
        <div>
          <p className="text-[12px] font-semibold text-black/80">
            Discuss and Support:
          </p>
          <p className="mt-[2px] text-[13px] leading-[1.35] text-black/60">
            You can comment and reply to comments, including voting on answers
            that help gear the conversation toward a beneficial result.
          </p>
          <div className="mt-[6px] flex flex-col gap-[6px]">
            <Button onPress={onUpvotePost} className="h-[30px] font-[400]">
              Upvote Post
            </Button>
            <Button onPress={onLeaveComment} className="h-[30px] font-[400]">
              Leave a Comment
            </Button>
            <Button onPress={onLeaveSentiment} className="h-[30px] font-[400]">
              Leave Your Sentiment
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[12px] font-semibold text-black/80">
            Give Answers:
          </p>
          <p className="mt-[2px] text-[13px] leading-[1.35] text-black/60">
            If you have an answer that remedies or provides sufficient
            information to the original poster, you can leave an answer.
          </p>
          <Button onPress={onAnswerComplaint} className="h-[30px] font-[400]">
            Answer Complaint
          </Button>
        </div>
      </div>
    </section>
  );
}
