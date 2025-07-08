import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import NextImage from 'next/image';

export const DropDownMenuData = {
  common: [
    {
      name: 'Whitepaper',
      link: 'https://ecf.wiki/doc/pensieve-paper-lite-eydqYnuYnP',
    },
    {
      name: 'Docs',
      link: 'https://ethereum-community-fund.gitbook.io/the-ecf-pensieve-decentralised-social-consensus',
    },
    {
      name: 'Changelog',
      link: 'https://ecf.wiki/s/0174d7fe-2818-4587-95ae-fd8b5b27b6ed',
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
      name: 'Feedback',
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
        <div className="rounded-[10px] p-1 hover:bg-[rgba(0,0,0,0.05)]">
          <Image
            as={NextImage}
            src="/images/common/DotsThree.png"
            className="cursor-pointer"
            alt="menu"
            width={24}
            height={24}
          />
        </div>
      </DropdownTrigger>
      <DropdownMenu>
        <>
          {DropDownMenuData.common.map((item) => (
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
