import { ReactNode } from 'react';

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="container page">
      <header className="page-header">
        <h1>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </header>
      {children}
    </div>
  );
}

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}

type FaqItemProps = {
  question: string;
  answer: ReactNode;
};

export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="faq-item">
      <h3>{question}</h3>
      <div className="faq-answer">{answer}</div>
    </div>
  );
}
