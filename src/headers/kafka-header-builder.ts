import { KafkaCarrier } from "./kafka-header-carrier.js";

export function createKafkaHeaders() {
  return new KafkaCarrier({});
}

