import { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'signUp' | 'signIn';
	children: React.ReactNode;
}

const variants = {
	signIn: 'text-base bg-[rgba(0,0,0,0.05)] flex items-center gap-2 w-[108px]',
	signUp: 'text-sm opacity-50 w-[73px]',
};

export function AuthButton({ variant = 'signIn', className, children, ...props }: ButtonProps) {
	return (
		<button
			className={cn(
				'h-8 px-[10px] font-semibold rounded-[5px] cursor-pointer transition-colors duration-200',
				'text-black hover:text-black hover:bg-[rgba(0,0,0,0.15)] active:bg-black',
				variants[variant],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
