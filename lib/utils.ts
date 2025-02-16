import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
	if (num >= 10000) {
		// 万以上的数字
		return (num / 10000).toFixed(2) + 'W';
	} else if (num >= 1000) {
		// 千以上的数字
		return (num / 1000).toFixed(1) + 'K';
	} else {
		// 三位数及以下正常展示
		return num.toString();
	}
}
