import { KafkaTopics, type KafkaProducerService } from "../src/index.js";

declare const producer: KafkaProducerService;

void producer.send({
  topic: KafkaTopics.user.deleteUser,
  payload: { userId: "user-1" },
});

void producer.send(
  KafkaTopics.user.deleteUser,
  { userId: "user-1" },
  "authentication-service",
);

void producer.sendBatch([
  {
    topic: KafkaTopics.user.deleteUser,
    payload: { userId: "user-1" },
  },
]);

void producer.send({
  topic: KafkaTopics.user.deleteUser,
  // @ts-expect-error userId is required by the event registry
  payload: { invalid: true },
});
