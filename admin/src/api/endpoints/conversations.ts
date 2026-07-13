import client from "../client";
import type { Conversation, Message, PaginationMeta } from "../../types";

interface ConversationsResponse {
  conversations: Conversation[];
  meta: PaginationMeta;
}

interface MessagesResponse {
  messages: Message[];
  meta: PaginationMeta;
}

export const fetchConversations = async (
  page: number,
): Promise<ConversationsResponse> => {
  const response = await client.get("/admin/conversations", {
    params: { page, limit: 10 },
  });
  return response.data.data;
};

export const fetchMessages = async (
  conversationId: string,
  page: number,
): Promise<MessagesResponse> => {
  const response = await client.get(
    `/conversations/${conversationId}/messages`,
    { params: { page, limit: 20 } },
  );
  return response.data.data;
};

export const sendAdminMessage = async (
  conversationId: string,
  content: string,
): Promise<Message> => {
  const response = await client.post(
    `/admin/conversations/${conversationId}/messages`,
    { content },
  );
  return response.data.data;
};
