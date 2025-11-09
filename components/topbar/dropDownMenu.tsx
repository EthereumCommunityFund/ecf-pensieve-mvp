import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import { DotsThree } from '@phosphor-icons/react';

type CommonLink = {
  name: string;
  link: string;
  isMobileOnly?: boolean;
};

export const DropDownMenuData: {
  common: CommonLink[];
  social: {
    name: string;
    icon: string;
    link: string;
  }[];
} = {
  common: [
    {
      name: 'Docs',
      link: 'https://ecf.wiki/s/ae77a12f-106c-429e-a7ed-8cca218bf20b',
    },
    {
      name: 'Irys Storage (Arweave)',
      link: 'https://gateway.irys.xyz/mutable/Cyq1oxWJFfMBvH7pJ83WACcJ7idnwnzUrm5LGzEqP4Xm',
    },
    {
      name: 'Changelog',
      link: 'https://ecf.wiki/s/8dc736c1-3f92-4488-b3a9-1ec82bccb1d9',
    },
    {
      name: 'About ECF Network',
      link: 'https://ecf.network/our-vision',
    },
    {
      name: 'Terms of Service',
      link: 'https://ecf.network/privacy-policy-and-terms-of-service',
    },
    {
      name: 'Privacy',
      link: 'https://ecf.network/privacy-policy-and-terms-of-service',
    },
    {
      name: 'Have Feedback?',
      link: 'https://discord.gg/9763r5XRpP',
    },
  ],
  social: [
    {
      name: 'Medium',
      icon: '/images/common/MediumLogo.png',
      link: 'https://medium.com/@EthereumECF',
    },
    {
      name: 'X',
      icon: '/images/common/XLogo.png',
      link: 'https://x.com/ethereumecf',
    },
    {
      name: 'Globe',
      icon: '/images/common/Globe.png',
      link: 'https://ecf.network/',
    },
    {
      name: 'Github',
      icon: '/images/common/GithubLogo.png',
      link: 'https://github.com/EthereumCommunityFund/ecf-pensieve-mvp',
    },
  ],
};

const DropDownMenu = () => {
  return (
    <Dropdown className="shrink-0">
      <DropdownTrigger>
        <div className="pc:rounded-[8px] tablet:rounded-[4px] cursor-pointer rounded-[10px] p-1 hover:bg-[rgba(0,0,0,0.05)]">
          <DotsThree className="pc:size-[18px] tablet:size-[16px] size-[24px] shrink-0" />
        </div>
      </DropdownTrigger>
      <DropdownMenu>
        <>
          {DropDownMenuData.common
            .filter((item) => !item.isMobileOnly)
            .map((item) => (
              <DropdownItem
                key={item.name}
                textValue={item.name}
                onPress={() => window.open(item.link, '_blank')}
              >
                <span className="cursor-pointer text-sm font-semibold text-black">
                  {item.name}
                </span>
              </DropdownItem>
            ))}

          <DropdownItem
            key="social"
            textValue="social"
            className="p-0 hover:bg-transparent"
          >
            <div className="flex items-center gap-2 bg-white px-2">
              {DropDownMenuData.social.map((item) => (
                <div
                  key={item.name}
                  onClick={() => window.open(item.link, '_blank')}
                  className="cursor-pointer rounded-md p-2 transition-colors hover:bg-[rgba(0,0,0,0.05)]"
                >
                  <Image
                    src={item.icon}
                    alt={item.name.toLowerCase()}
                    width={24}
                    height={24}
                  />
                </div>
              ))}
            </div>
          </DropdownItem>
        </>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DropDownMenu;
