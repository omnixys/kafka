/**
 * Global Kafka event registry for the Omnixys platform.
 *
 * Maps Kafka topics to their payload types.
 */

import { EventAddressInput } from "@omnixys/graphql";
import { KafkaTopics } from "./kafka-topics.js";
import {
  AddUserIdDTO,
  CreateUserAddressDTO,
  CreateUserProviderDTO,
  EventActionDTO,
  UserActionDTO,
  CreateSeatDTO,
  LogEventDTO,
  SendMagicLinkDTO,
  SendResetLinkDTO,
} from "@omnixys/shared";

/**
 * Event payload definitions
 */
export interface KafkaEventRegistry {
  [KafkaTopics.address.createEventAddress]: EventAddressInput;
  [KafkaTopics.address.deleteEventAddress]: EventActionDTO;
  [KafkaTopics.address.createUserAddresses]: CreateUserAddressDTO;
  [KafkaTopics.address.deleteUserAddresses]: UserActionDTO;

  [KafkaTopics.logstream.authentication]: LogEventDTO;
  [KafkaTopics.logstream.event]: LogEventDTO;
  [KafkaTopics.logstream.seat]: LogEventDTO;

  [KafkaTopics.notification.sendCredentials]: string;
  [KafkaTopics.notification.sendRequestReset]: SendResetLinkDTO;
  [KafkaTopics.notification.sendMagicLink]: SendMagicLinkDTO;

  [KafkaTopics.seat.create]: CreateSeatDTO;
  [KafkaTopics.seat.delete]: EventActionDTO;

  // [KafkaTopics.user.createUser]: EventAction;
  // [KafkaTopics.user.addId]: EventAction;
  [KafkaTopics.user.deleteUser]: UserActionDTO;
  [KafkaTopics.user.addId]: AddUserIdDTO;
  [KafkaTopics.user.createProviderUser]: CreateUserProviderDTO;

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
}
