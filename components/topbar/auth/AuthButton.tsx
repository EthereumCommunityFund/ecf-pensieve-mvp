import { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'signUp' | 'signIn';
	children: React.ReactNode;
}

const variants = {
	signUp: 'opacity-50 text-black hover:bg-[rgba(0,0,0,0.15)] hover:text-black active:bg-black active:text-white',
	signIn: 'bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)] hover:text-black active:bg-black active:text-white flex items-center gap-2',
};

export function AuthButton({ variant = 'signIn', className, children, ...props }: ButtonProps) {
	return (
		<button
			className={cn(
				'h-8 px-[10px] py-1 text-sm font-semibold rounded-[5px] cursor-pointer transition-colors duration-200',
				variants[variant],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
