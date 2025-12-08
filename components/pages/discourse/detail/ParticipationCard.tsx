'use client';

import { Button } from '@/components/base';

type ParticipationCardProps = {
  onSupportClaim?: () => void;
  onPostComment?: () => void;
  onChallengeClaim?: () => void;
  supportDisabled?: boolean;
  supportLoading?: boolean;
  commentDisabled?: boolean;
  commentLoading?: boolean;
  challengeDisabled?: boolean;
  challengeLoading?: boolean;
};

export function ParticipationCard({
  onSupportClaim,
  onPostComment,
  onChallengeClaim,
  supportDisabled = false,
  supportLoading = false,
  commentDisabled = false,
  commentLoading = false,
  challengeDisabled = false,
  challengeLoading = false,
}: ParticipationCardProps) {
  const supportUnavailable = supportDisabled || !onSupportClaim;
  const commentUnavailable = commentDisabled || !onPostComment;
  const challengeUnavailable = challengeDisabled || !onChallengeClaim;

  return (
    <div className="rounded-[10px] border border-black/10 bg-white p-3.5 shadow-sm">
      <p className="text-sm font-semibold text-black">How to participate?</p>
      <div className="mt-3.5 space-y-3.5">
        <div className="space-y-2.5">
          <div>
            <p className="text-[12px] font-semibold text-black/80">
              Support Main Claim:
            </p>
            <p className="mt-1 text-[13px] text-black/60">
              You can support this post as a scam by voting with your
              Contribution Points (CP) under this post. Once the Scam Acceptance
              Threshold is reached, it will display a label on the project page.
            </p>
          </div>
          <div className="flex flex-col gap-[5px]">
            <Button
              type="button"
              className="h-[30px] font-[400]"
              onPress={onSupportClaim}
              isDisabled={supportUnavailable}
              isLoading={supportLoading}
            >
              Support Claim
            </Button>
            <Button
              type="button"
              className="h-[30px] font-[400]"
              onPress={onPostComment}
              isDisabled={commentUnavailable}
              isLoading={commentLoading}
            >
              Post a Comment
            </Button>
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <p className="text-[12px] font-semibold text-black/80">
              Counter Claim:
            </p>
            <p className="mt-1 text-[13px] text-black/60">
              If you disagree with this post, you can either create a counter
              claim and gather support from the community or you can vote for
              any existing counter claims.
            </p>
          </div>
          <div className="flex">
            <Button
              type="button"
              className="h-[30px] w-full font-[400]"
              onPress={onChallengeClaim}
              isDisabled={challengeUnavailable}
              isLoading={challengeLoading}
            >
              Challenge Claim
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
