export interface CommentDTO {
  id: string
  submissionId: string
  authorName: string
  content: string
  createdAt: string
}

const MOCK_COMMENTS: Record<string, CommentDTO[]> = {
  shortlisted: [
    { id: 'c1', submissionId: 'mock', authorName: 'Director', content: 'Excellent presence and emotional range. We will be in touch for the callback.', createdAt: 'Jul 11, 2026' },
    { id: 'c2', submissionId: 'mock', authorName: 'Casting Assistant', content: 'Agreed. Strong candidate for the lead role.', createdAt: 'Jul 12, 2026' },
  ],
  reviewed: [
    { id: 'c3', submissionId: 'mock', authorName: 'Director', content: 'Good diction but needs more depth in the emotional scenes.', createdAt: 'Jul 10, 2026' },
  ],
  rejected: [
    { id: 'c4', submissionId: 'mock', authorName: 'Director', content: 'Unfortunately, we are moving in a different direction for this role.', createdAt: 'Jul 9, 2026' },
  ],
}

export async function fetchComments(submissionStatus: string): Promise<CommentDTO[]> {
  return new Promise(resolve => {
    setTimeout(() => resolve(MOCK_COMMENTS[submissionStatus] ?? []), 300)
  })
}
