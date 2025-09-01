const ProjectIntro = () => {
  return (
    <div className="mt-[20px] flex  flex-col gap-[10px]">
      <p className="font-inter text-[16px] font-[400] leading-[1.6] text-black ">
        <a
          href="https://ethereum-community-fund.gitbook.io/the-ecf-pensieve-decentralised-social-consensus"
          target="_blank"
          className=" underline decoration-solid decoration-1 underline-offset-2 hover:opacity-60"
          rel="noreferrer"
        >
          Pensieve.ecf
        </a>{' '}
        is an open-source wiki for Web3. It helps communities record, verify,
        and keep track of project history, beyond hype, beyond rug pulls. Think
        of it as info defense, collective memory, and on-chain reputation, all
        in one.
      </p>
      <p className="font-mona text-[16px] font-[500] leading-[1.6] text-black ">
        Use it to: 📖 Track credible projects 🛡 Defend against misinformation
        📡 Strengthen the d/acc civic layer
      </p>
    </div>
  );
};

export default ProjectIntro;
