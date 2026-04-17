import { trace, SpanStatusCode, type SpanOptions } from '@opentelemetry/api';

const tracer = trace.getTracer('bank-system-api');

export async function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  options?: SpanOptions
): Promise<T> {
  return tracer.startActiveSpan(name, options ?? {}, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      throw err;
    } finally {
      span.end();
    }
  });
}
