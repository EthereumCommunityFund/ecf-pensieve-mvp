import { useExternalLink } from '@/context/ExternalLinkContext';

import { SablierIcon } from '../icons';

const SablierEntry = () => {
  const { openExternalLink } = useExternalLink();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openExternalLink('https://sablier.com');
  };

  return (
    <a
      href="https://sablier.com"
      onClick={handleClick}
      className="cursor-pointer"
    >
      <SablierIcon />
    </a>
  );
};

export default SablierEntry;
