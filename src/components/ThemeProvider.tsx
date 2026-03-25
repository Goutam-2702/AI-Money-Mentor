"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
