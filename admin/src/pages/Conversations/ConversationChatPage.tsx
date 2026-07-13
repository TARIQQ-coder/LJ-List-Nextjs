import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type FormEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { useAuthStore } from "../../store/auth";
import { formatDateTime } from "../../lib/utils";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  fetchMessages,
  sendAdminMessage,
} from "../../api/endpoints/conversations";
import type { Message } from "../../types";

export const ConversationChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchMessages(id, 1);
      // messages come oldest-first from the API
      setMessages(res.messages);
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not load messages"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newMessage.trim()) return;

    setSending(true);
    try {
      const sent = await sendAdminMessage(id, newMessage.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not send message"));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface-overlay rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-16 w-2/3 bg-surface-overlay rounded-xl animate-pulse ${
                i % 2 === 0 ? "ml-auto" : ""
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Conversation"
        action={
          <button
            onClick={() => navigate("/conversations")}
            className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {error && (
          <p className="text-sm text-red-500 pb-2 border-b border-surface-border">
            {error}
          </p>
        )}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-muted text-sm">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? "bg-white text-black"
                      : "bg-surface-raised border border-surface-border text-white"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine ? "text-black/50" : "text-surface-muted"
                    }`}
                  >
                    {formatDateTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 pt-4 border-t border-surface-border"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          autoFocus
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-3 rounded-xl cursor-pointer"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};
