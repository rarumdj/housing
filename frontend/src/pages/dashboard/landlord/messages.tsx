import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { cn } from '@/lib/utils';
import { useConversationsQuery, useThreadQuery, useSendMessageMutation } from '@/services/messages/queries';
import { MessageThread } from '@/components/landlord/message-thread';

export default function LandlordMessagesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthManager();

  const initialRecipient = searchParams.get('recipient') ?? '';
  const initialProperty = searchParams.get('property') ?? '';

  const [selectedRecipient, setSelectedRecipient] = useState(initialRecipient);
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(initialProperty || undefined);

  const { data: convData, isLoading: convLoading } = useConversationsQuery();
  const conversations = convData?.data ?? [];

  const { data: threadData } = useThreadQuery(selectedRecipient, selectedProperty);
  const messages = threadData?.data ?? [];

  const sendMutation = useSendMessageMutation();

  useEffect(() => {
    if (initialRecipient) {
      setSelectedRecipient(initialRecipient);
      setSelectedProperty(initialProperty || undefined);
    }
  }, [initialRecipient, initialProperty]);

  const getOtherUser = (conv: typeof conversations[0]) => {
    if (conv.senderId === user?.id) return conv.recipient;
    return conv.sender;
  };

  const selectedConv = conversations.find((c) => {
    const other = getOtherUser(c);
    return other.id === selectedRecipient;
  });

  const recipientName = selectedConv
    ? (() => { const o = getOtherUser(selectedConv); return `${o.firstName} ${o.lastName}`; })()
    : 'New Conversation';

  const handleSend = (body: string) => {
    sendMutation.mutate({
      recipientId: selectedRecipient,
      propertyId: selectedProperty,
      body,
    });
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <button
          onClick={() => navigate(dashboardKeys.landlord.home.path)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <h1 className="mb-6 font-display text-2xl font-bold">Messages</h1>

        <div className="flex overflow-hidden rounded-2xl border border-border bg-background" style={{ height: 'calc(100vh - 220px)' }}>
          {/* Conversation List */}
          <div className="w-80 flex-shrink-0 border-r border-border">
            <div className="border-b border-border p-4">
              <h3 className="text-sm font-bold">Conversations</h3>
            </div>

            {convLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border overflow-y-auto">
                {conversations.map((conv) => {
                  const other = getOtherUser(conv);
                  const isSelected = other.id === selectedRecipient;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedRecipient(other.id);
                        setSelectedProperty(conv.propertyId ?? undefined);
                      }}
                      className={cn(
                        'w-full p-4 text-left transition-colors hover:bg-muted/50',
                        isSelected && 'bg-muted',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {other.firstName[0]}{other.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {other.firstName} {other.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {conv.body}
                          </p>
                          {conv.property && (
                            <p className="truncate text-[10px] text-primary">
                              {conv.property.title}
                            </p>
                          )}
                        </div>
                        {!conv.readAt && conv.recipientId === user?.id && (
                          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Thread */}
          <div className="flex-1">
            {selectedRecipient ? (
              <MessageThread
                messages={messages}
                currentUserId={user?.id ?? ''}
                recipientName={recipientName}
                propertyTitle={selectedConv?.property?.title}
                onSend={handleSend}
                isSending={sendMutation.isPending}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="mt-1 text-sm text-muted-foreground">Choose from the list or start from a property page</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
