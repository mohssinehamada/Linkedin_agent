type Handler = (payload: any) => void | Promise<void>;

const bus = new Map<string, Set<Handler>>();

export function on(event: string, handler: Handler) {
  if (!bus.has(event)) bus.set(event, new Set());
  bus.get(event)!.add(handler);
}

export async function emit(event: string, payload: any) {
  const handlers = bus.get(event);
  if (!handlers) return;
  for (const h of handlers) await h(payload);
}


