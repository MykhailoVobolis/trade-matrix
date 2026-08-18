import type { ReactNode } from "react";

type AuthRoutesLayoutProps = {
  children: ReactNode;
};

export default function AuthRoutesLayout({
  children,
}: AuthRoutesLayoutProps) {
  return children;
}
