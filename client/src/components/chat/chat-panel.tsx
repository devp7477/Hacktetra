import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { XIcon, SendIcon, PaperclipIcon, SmileIcon } from "lucide-react";

interface ChatPanelProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ projectId, projectName, isOpen, onClose }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], refetch } = useQuery({
    queryKey: [`/api/projects/${projectId}/chat`],
    enabled: isOpen && !!projectId,
  });

  // WebSocket connection
  useEffect(() => {
    if (isOpen && projectId) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setWs(socket);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.projectId === projectId) {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/chat`] });
        }
      };

      socket.onclose = () => {
        setWs(null);
      };

      return () => {
        socket.close();
      };
    }
  }, [isOpen, projectId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat_message',
        projectId,
        userId: user?.id,
        content: message.trim(),
      }));
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-80 bg-card border-l border-border transform transition-transform duration-300 z-40 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      data-testid="chat-panel"
    >
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold" data-testid="text-chat-project-name">
              {projectName}
            </h3>
            <p className="text-sm text-muted-foreground">Team Chat</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            data-testid="button-close-chat"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg: any) => {
              const isCurrentUser = msg.user?.id === user?.id;
              
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.user?.profileImageUrl} />
                    <AvatarFallback>
                      {msg.user?.firstName?.[0]}{msg.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={isCurrentUser ? "text-right" : ""}>
                    <div className={`flex items-center space-x-2 mb-1 ${
                      isCurrentUser ? "justify-end" : ""
                    }`}>
                      <span className="font-medium text-sm" data-testid="text-message-author">
                        {isCurrentUser ? "You" : `${msg.user?.firstName} ${msg.user?.lastName}`}
                      </span>
                      <span className="text-xs text-muted-foreground" data-testid="text-message-time">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                    <div 
                      className={`rounded-lg p-3 text-sm max-w-xs ${
                        isCurrentUser 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                      data-testid="text-message-content"
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={2}
                className="resize-none"
                data-testid="textarea-chat-message"
              />
            </div>
            <Button 
              size="sm" 
              onClick={sendMessage}
              disabled={!message.trim() || !ws || ws.readyState !== WebSocket.OPEN}
              data-testid="button-send-message"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <PaperclipIcon className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <SmileIcon className="h-3 w-3" />
              </Button>
            </div>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
