import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Image } from '@heroui/react';
import NextImage from 'next/image';
import styled from '@emotion/styled';

const DropDownMenu = () => {
	return (
		<Dropdown className="shrink-0">
			<DropdownTrigger>
				<Image
					as={NextImage}
					src="/images/common/DotsThree.png"
					className="cursor-pointer"
					alt="menu"
					width={24}
					height={24}
				/>
			</DropdownTrigger>
			<DropdownMenu aria-label="Static Actions">
				<DropdownItem key="Whitepaper">
					<MenuItemLink>Whitepaper</MenuItemLink>
				</DropdownItem>
				<DropdownItem key="Docs">
					<MenuItemLink>Docs</MenuItemLink>
				</DropdownItem>
				<DropdownItem key="Changelog">
					<MenuItemLink>Changelog</MenuItemLink>
				</DropdownItem>
				<DropdownItem key="about">
					<MenuItemLink>About ECF Network</MenuItemLink>
				</DropdownItem>
				<DropdownItem key="Terms">
					<MenuItemLink>Terms of Service</MenuItemLink>
				</DropdownItem>
				<DropdownItem key="Privacy">
					<MenuItemLink>Privacy</MenuItemLink>
				</DropdownItem>
				<DropdownItem key="social">
					<div className="flex justify-start items-center gap-2.5">
						<Image
							src="/images/common/MediumLogo.png"
							alt="Twitter"
							width={24}
							height={24}
						/>
						<Image
							src="/images/common/XLogo.png"
							alt="Telegram"
							width={24}
							height={24}
						/>
						<Image
							src="/images/common/Globe.png"
							alt="Discord"
							width={24}
							height={24}
						/>
						<Image
							src="/images/common/GithubLogo.png"
							alt="Discord"
							width={24}
							height={24}
						/>
					</div>
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
};

export default DropDownMenu;

const MenuItemLink = styled('p')({
	color: '#000',
	fontSize: '14px',
	fontWeight: '600',
});
