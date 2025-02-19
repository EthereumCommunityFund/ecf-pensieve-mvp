'use client';

import { Button, ButtonProps, cn } from '@heroui/react';

function StyledButton({ className, children, ...props }: ButtonProps) {
	return (
		<Button
			className={cn(
				'flex items-center gap-2',
				'h-[42px] py-2.5 px-5 rounded-[5px] shrink-0',
				'text-base font-bold text-black',
				'bg-[rgba(0,0,0,0.05)]  hover:bg-[rgba(0,0,0,0.15)] hover:text-black active:bg-black active:text-white',
				'transition-colors duration-200',
				className,
			)}
			{...props}
		>
			{children}
		</Button>
	);
}

export default StyledButton;
