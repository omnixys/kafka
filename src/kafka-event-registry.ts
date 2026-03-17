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
  [KafkaTopics.address.restart]: UserActionDTO;
  [KafkaTopics.address.shutdown]: UserActionDTO;

  [KafkaTopics.admin.allRestart]: UserActionDTO;
  [KafkaTopics.admin.allShutdown]: UserActionDTO;

  [KafkaTopics.authentication.restart]: UserActionDTO;
  [KafkaTopics.authentication.shutdown]: UserActionDTO;

  [KafkaTopics.event.restart]: UserActionDTO;
  [KafkaTopics.event.shutdown]: UserActionDTO;

  [KafkaTopics.invitation.restart]: UserActionDTO;
  [KafkaTopics.invitation.shutdown]: UserActionDTO;

  [KafkaTopics.logstream.authentication]: LogEventDTO;
  [KafkaTopics.logstream.event]: LogEventDTO;
  [KafkaTopics.logstream.seat]: LogEventDTO;
  [KafkaTopics.logstream.restart]: UserActionDTO;
  [KafkaTopics.logstream.shutdown]: UserActionDTO;

  [KafkaTopics.notification.sendCredentials]: string;
  [KafkaTopics.notification.sendRequestReset]: SendResetLinkDTO;
  [KafkaTopics.notification.sendMagicLink]: SendMagicLinkDTO;
  // [KafkaTopics.notification.createUser]: MailDTO;
  [KafkaTopics.notification.restart]: UserActionDTO;
  [KafkaTopics.notification.shutdown]: UserActionDTO;

  [KafkaTopics.seat.create]: CreateSeatDTO;
  [KafkaTopics.seat.delete]: EventActionDTO;
  [KafkaTopics.seat.restart]: UserActionDTO;
  [KafkaTopics.seat.shutdown]: UserActionDTO;

  [KafkaTopics.ticket.restart]: UserActionDTO;
  [KafkaTopics.ticket.shutdown]: UserActionDTO;

  // [KafkaTopics.user.createUser]: EventAction;
  // [KafkaTopics.user.addId]: EventAction;
  [KafkaTopics.user.deleteUser]: UserActionDTO;
  [KafkaTopics.user.addId]: AddUserIdDTO;
  [KafkaTopics.user.createProviderUser]: CreateUserProviderDTO;
  [KafkaTopics.user.shutdown]: UserActionDTO;
  [KafkaTopics.user.restart]: UserActionDTO;

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
