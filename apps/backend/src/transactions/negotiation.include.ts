export const transactionInclude = {
  sender: true,
  receiver: true,
  senderCards: {
    orderBy: { id: 'asc' as const },
  },
  receiverCards: {
    orderBy: { id: 'asc' as const },
  },
  comments: {
    orderBy: { createdAt: 'asc' as const },
  },
};
