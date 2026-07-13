import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { TableSkeleton } from "../../components/shared/LoadingSkeleton";
import { Pagination } from "../../components/shared/Pagination";
import { EmptyState } from "../../components/shared/EmptyState";
import { usePagination } from "../../hooks/usePagination";
import { formatDate } from "../../lib/utils";
import { fetchConversations } from "../../api/endpoints/conversations";
import type { Conversation } from "../../types";

export const ConversationListPage = () => {
  const navigate = useNavigate();
  const { page, meta, loading, setLoading, setMeta, goNext, goPrev } =
    usePagination();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchConversations(page);
      setConversations(res.conversations);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, [page, setLoading, setMeta]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div>
      <PageHeader title="Conversations" description="Customer support inbox" />

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations"
          description="No customer conversations yet."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {conversations.map((convo) => (
            <motion.div
              key={convo.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/conversations/${convo.id}`)}
              className="bg-surface-raised border border-surface-border rounded-xl p-5 cursor-pointer hover:border-surface-muted transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {convo.other_user.display_name}
                    </span>
                    <span className="text-xs text-surface-muted font-mono">
                      {convo.other_user.phone_number}
                    </span>
                  </div>
                  <p className="text-sm text-surface-muted truncate">
                    {convo.last_message}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {convo.unread_count > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-black text-xs font-medium">
                      {convo.unread_count}
                    </span>
                  )}
                  <span className="text-xs text-surface-muted">
                    {formatDate(convo.created_at)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Pagination meta={meta} onNext={goNext} onPrev={goPrev} />
    </div>
  );
};
