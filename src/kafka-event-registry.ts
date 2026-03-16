/**
 * Global Kafka event registry for the Omnixys platform.
 *
 * Maps Kafka topics to their payload types.
 */

import { CreateSeatDTO, LogEventDTO } from "@omnixys/contracts";
import { KafkaTopics } from "./kafka-topics.js";
import { EventAddressInput } from "@omnixys/graphql";

/**
 * Event payload definitions
 */
export interface KafkaEventRegistry {
  // [KafkaTopics.ticket.deleteTickets]: {
  //   userId: string;
  // };

  // [KafkaTopics.invitation.deleteInvitation]: {
  //   invitationId: string;
  // };

  // [KafkaTopics.invitation.addGuestId]: {
  //   invitationId: string;
  //   guestId: string;
  // };

  [KafkaTopics.seat.createSeats]: CreateSeatDTO;

  [KafkaTopics.address.createAddress]: EventAddressInput;

  [KafkaTopics.logstream.event]: LogEventDTO;
  [KafkaTopics.logstream.seat]: LogEventDTO;
}
