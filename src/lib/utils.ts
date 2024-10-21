import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const currencyFormat = (amount: number | undefined) => {
  if (amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  } else return 0
}
