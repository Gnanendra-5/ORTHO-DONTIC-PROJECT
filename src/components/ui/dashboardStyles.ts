export const inputBaseClassName =
  'h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-50 outline-none transition duration-200 placeholder:text-slate-500 focus:border-sky-400 focus:bg-slate-950 focus:ring-4 focus:ring-sky-500/10';

export const labelClassName = 'mb-2 block text-sm text-slate-400';

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}
