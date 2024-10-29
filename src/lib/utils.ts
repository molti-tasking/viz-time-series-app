import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function deepMerge(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
) {
  const result = { ...obj1 };
  for (const key in obj2) {
    if (Array.isArray(obj2[key]) && Array.isArray(obj1[key])) {
      result[key] = obj1[key].concat(obj2[key]);
    } else if (obj2[key] instanceof Object && key in obj1) {
      result[key] = deepMerge(
        obj1[key] as Record<string, unknown>,
        obj2[key] as Record<string, unknown>
      );
    } else {
      result[key] = obj2[key];
    }
  }
  return result;
}
