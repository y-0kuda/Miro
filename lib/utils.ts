import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// number型を引数で受けて、string型を返す
export function connectionIdToColor(connectionId: number): string {
  // connectionIdをCOLORS.lengthで割ったときの余り
  // 余りは0~4の間となるため、COLORSが割り当てられる
  return COLORS[connectionId % COLORS.length];
}
