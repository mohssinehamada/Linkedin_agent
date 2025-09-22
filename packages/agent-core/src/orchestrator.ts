export type Stage = 'discover' | 'rank' | 'approve' | 'tailor' | 'autoform' | 'submit';

export async function runApplication(jobUrl: string, candidateId: string) {
  // stub orchestrator to be implemented later
  return { jobUrl, candidateId };
}


