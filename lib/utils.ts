import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import { isAddress } from 'viem';

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

export function formatTimeAgo(timestamp: number): string {
	const now = dayjs();
	const inputTime = dayjs(timestamp);
	const diffInDays = now.diff(inputTime, 'day');

	if (now.diff(inputTime, 'hour') < 24) {
		return 'today';
	} else if (diffInDays < 7) {
		return `${diffInDays}d`;
	} else if (diffInDays < 30) {
		return `${Math.floor(diffInDays / 7)}W`;
	} else if (now.diff(inputTime, 'month') < 12) {
		return `${now.diff(inputTime, 'month')}M`;
	} else {
		return `${now.diff(inputTime, 'year')}Y`;
	}
}

export function getShortenAddress(address: string): string {
	if (!address) return '';
	if (!isAddress(address)) return '';

	const start = address.slice(0, 6);
	const end = address.slice(-4);

	return `${start}..${end}`;
}
