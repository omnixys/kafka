/**
 * Global Kafka event registry for the Omnixys platform.
 *
 * Maps Kafka topics to their payload types.
 */

import { KafkaTopics } from "./kafka-topics.js";

/**
 * Event payload definitions
 */
export interface KafkaEventRegistry {
  [KafkaTopics.ticket.deleteTickets]: {
    userId: string;
  };

  [KafkaTopics.invitation.deleteInvitation]: {
    invitationId: string;
  };

  [KafkaTopics.invitation.addGuestId]: {
    invitationId: string;
    guestId: string;
  };

  [KafkaTopics.logstream.log]: {
    level: "info" | "warn" | "error";
    message: string;
  };
}
