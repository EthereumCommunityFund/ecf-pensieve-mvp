import { useRouter } from 'next/navigation';

import { Button } from '@/components/base';
import { VoteIcon } from '@/components/icons';
import FilePlusIcon from '@/components/icons/FilePlus';
import HandCoinsIcon from '@/components/icons/HandCoins';
import { useAuth } from '@/context/AuthContext';

const ProjectIntroCard = () => {
  const { profile, showAuthPrompt } = useAuth();
  const router = useRouter();
  const proposeProject = () => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    router.push('/project/create');
  };

  const exploreIndex = () => {
    router.push('/projects');
  };

  return (
    <div className="flex flex-col gap-[10px] rounded-[10px] border border-black/10 bg-white p-[14px]">
      {/* Header */}
      <h2 className="font-mona text-[16px] font-bold leading-[26px] text-black/80">
        About Pensieve
      </h2>

      {/* Description */}
      <p className="font-inter text-[15px] font-normal leading-[24px] text-black">
        <a
          href="https://ethereum-community-fund.gitbook.io/the-ecf-pensieve-decentralised-social-consensus"
          target="_blank"
          className="underline decoration-solid decoration-1 underline-offset-2 hover:opacity-60"
          rel="noreferrer"
        >
          Pensieve.ecf
        </a>{' '}
        is an open-source wiki for Web3. It helps communities record, verify,
        and keep track of project history, beyond hype, beyond rug pulls. Think
        of it as info defense, collective memory, and on-chain reputation, all
        in one.
      </p>

      {/* Use cases */}
      <p className="font-mona text-[14px] font-medium leading-[22px] text-black">
        Use it to: 📖 Track credible projects 🛡 Defend against misinformation
        📡 Strengthen the d/acc civic layer
      </p>

      {/* background: linear-gradient(66deg, rgba(255, 255, 255, 0.20) 2.09%, rgba(100, 192, 165, 0.20) 100%); */}
      {/* Action items */}
      <div
        className="flex flex-col gap-[10px] rounded-[10px] border border-black/5 p-[10px]"
        style={{
          background:
            'linear-gradient(66deg, rgba(255, 255, 255, 0.20) 2.09%, rgba(100, 192, 165, 0.20) 100%)',
        }}
      >
        <Button
          onPress={proposeProject}
          className="flex h-[38px] items-center justify-start gap-[10px] rounded-[5px] border border-black/10 bg-white/40 px-[10px] py-[8px] transition-colors hover:bg-gray-50"
        >
          <FilePlusIcon />
          <span className="font-mona-sans text-[14px] font-semibold leading-[22px] text-black">
            Add Your Favorite Projects
          </span>
        </Button>

        <Button
          onPress={exploreIndex}
          className="flex h-[38px] items-center justify-start gap-[10px] rounded-[5px] border border-black/10 bg-white/40 px-[10px] py-[8px] transition-colors hover:bg-gray-50"
        >
          <VoteIcon className="size-[20px] opacity-30" />
          <span className="font-mona-sans text-[14px] font-semibold leading-[22px] text-black">
            Vote For Trusted Projects
          </span>
        </Button>

        <Button
          disabled={true}
          className="flex h-[38px] cursor-not-allowed items-center justify-start gap-[10px] rounded-[5px] border border-black/10 bg-white/40 px-[10px] py-[8px] opacity-30 hover:bg-transparent hover:text-black/30 hover:opacity-30"
        >
          <HandCoinsIcon className="" />
          <span className="font-mona-sans text-[14px] font-semibold leading-[22px] text-black">
            Claim Rewards (coming soon)
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ProjectIntroCard;
