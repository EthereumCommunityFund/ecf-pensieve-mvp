import styled from '@emotion/styled';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';

export const DropDownMenuData = {
  common: [
    {
      name: 'Whitepaper',
      link: '/whitepaper',
    },
    {
      name: 'Docs',
      link: '/docs',
    },
    {
      name: 'Changelog',
      link: '/changelog',
    },
    {
      name: 'About ECF Network',
      link: '/about',
    },
    {
      name: 'Terms of Service',
      link: '/terms',
    },
    {
      name: 'Privacy',
      link: '/privacy',
    },
  ],
  social: [
    {
      name: 'Medium',
      icon: '/images/common/MediumLogo.png',
      link: '/',
    },
    {
      name: 'X',
      icon: '/images/common/XLogo.png',
      link: '/',
    },
    {
      name: 'Globe',
      icon: '/images/common/Globe.png',
      link: '/',
    },
    {
      name: 'Github',
      icon: '/images/common/GithubLogo.png',
      link: '/',
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
            <DropdownItem key={item.name} textValue={item.name}>
              <MenuItemLink href={item.link}>{item.name}</MenuItemLink>
            </DropdownItem>
          ))}

          {/* 社交媒体图标容器 */}
          <DropdownItem
            key="social"
            textValue="social"
            className="p-0 hover:bg-transparent"
          >
            <div className="flex items-center gap-2 bg-white px-2">
              {DropDownMenuData.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="rounded-md p-2 transition-colors hover:bg-[rgba(0,0,0,0.05)]"
                >
                  <Image
                    src={item.icon}
                    alt={item.name.toLowerCase()}
                    width={24}
                    height={24}
                  />
                </Link>
              ))}
            </div>
          </DropdownItem>
        </>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DropDownMenu;

const MenuItemLink = styled(Link)({
  color: '#000',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
});
