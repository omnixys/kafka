import { HeaderCarrier } from "@omnixys/observability";

export class KafkaHeaderCarrier implements HeaderCarrier {
  constructor(private readonly headers: Record<string, Buffer>) {}

  get(key: string): string | undefined {
    return this.headers[key]?.toString();
  }

  set(key: string, value: string): void {
    this.headers[key] = Buffer.from(value);
  }

  toKafkaHeaders(): Record<string, Buffer> {
    return this.headers;
  }
}
