// Streaming text component with cursor animation
interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
}

export function StreamingText({ content, isStreaming = false }: StreamingTextProps) {
  return (
    <span className="whitespace-pre-wrap">
      {content}
      {isStreaming && (
        <span className="inline-block w-[2px] h-4 ml-1 bg-current animate-pulse" />
      )}
    </span>
  );
}
