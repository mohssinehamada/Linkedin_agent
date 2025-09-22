export type ApplicationStage = 'discover' | 'rank' | 'approve' | 'tailor' | 'autoform' | 'submit';

export type RunState = {
  id: string;
  applicationId?: string;
  stage: ApplicationStage;
  success?: boolean;
  startedAt: number;
  endedAt?: number;
  logs: any[];
};

export function startRun(stage: ApplicationStage): RunState {
  return { id: Math.random().toString(36).slice(2), stage, startedAt: Date.now(), logs: [] };
}

export function endRun(run: RunState, success = true) {
  run.success = success;
  run.endedAt = Date.now();
  return run;
}


