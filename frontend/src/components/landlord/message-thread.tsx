import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextInput } from '@/components/forms/atoms/text-input';
import { CustomButton } from '@/components/button';
import type { Message } from '@/types/domain';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  recipientName: string;
  propertyTitle?: string;
  onSend: (body: string) => void;
  isSending?: boolean;
}

export function MessageThread({
  messages,
  currentUserId,
  recipientName,
  propertyTitle,
  onSend,
  isSending,
}: MessageThreadProps) {
  const [body, setBody] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSend(body.trim());
    setBody('');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <p className="font-bold">{recipientName}</p>
        {propertyTitle && (
          <p className="text-xs text-muted-foreground">Re: {propertyTitle}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5',
                      isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted',
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <p className={cn('mt-1 text-[10px]', isMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <TextInput
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <CustomButton
            type="submit"
            variant="primary"
            size="icon"
            disabled={!body.trim() || isSending}
            loading={isSending}
            icon={!isSending ? <Send className="h-4 w-4" /> : undefined}
            aria-label="Send message"
          />
        </div>
      </form>
    </div>
  );
}
