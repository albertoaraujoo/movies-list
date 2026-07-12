import type { ReviewComment } from "@/lib/types";

export function buildCommentTree(comments: ReviewComment[]): ReviewComment[] {
  const nodes = new Map<string, ReviewComment>();

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, replies: [] });
  });

  const roots: ReviewComment[] = [];

  nodes.forEach((comment) => {
    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)!.replies!.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function displayAuthorName(user: { name: string; username: string | null }) {
  return user.username ? `@${user.username}` : user.name;
}
