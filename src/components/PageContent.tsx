import { JSX, ReactNode } from "react";

type Props = {
  children: ReactNode;
}

export function PageContent({ children }: Props): JSX.Element {
  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      {children}
    </div>
  )
}
