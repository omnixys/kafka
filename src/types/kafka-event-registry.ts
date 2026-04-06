/**
 * Global Kafka event registry for the Omnixys platform.
 *
 * Maps Kafka topics to their payload types.
 */

import type {
  ActorIdDTO,
  AddEventRoleDTO,
  CreateUserAddressDTO,
  CreateUserDTO,
  CreateUserProviderDTO,
  EventActionDTO,
  EventAddress,
  UserActionDTO,
  UserIdDTO,
  UserCredentialsDTO,
  SendAuthLinkDTO,
  TokenDTO,
  CreateSeatDTO,
  TokenUserActionDTO,
  AddGuestIdToInvitationDTO,
  GuestNotificationDTO,
  CreateGuestDTO,
} from "@omnixys/shared";
import { KafkaTopics } from "./kafka-topics.js";
import { LogDTO } from "../kafka.dto.js";

/**
 * Event payload definitions
 */
export interface KafkaEventRegistry {
  [KafkaTopics.address.createEventAddress]: EventAddress;
  [KafkaTopics.address.deleteEventAddress]: EventActionDTO;
  [KafkaTopics.address.createUserAddresses]: CreateUserAddressDTO;
  [KafkaTopics.address.deleteUserAddresses]: UserIdDTO;

  [KafkaTopics.address.restart]: ActorIdDTO;
  [KafkaTopics.address.shutdown]: ActorIdDTO;

  [KafkaTopics.admin.allRestart]: ActorIdDTO;
  [KafkaTopics.admin.allShutdown]: ActorIdDTO;

  [KafkaTopics.authentication.restart]: ActorIdDTO;
  [KafkaTopics.authentication.shutdown]: ActorIdDTO;

  [KafkaTopics.event.restart]: ActorIdDTO;
  [KafkaTopics.event.shutdown]: ActorIdDTO;
  [KafkaTopics.event.addRole]: AddEventRoleDTO;
  [KafkaTopics.event.removeRoles]: UserActionDTO;

  [KafkaTopics.gateway.restart]: ActorIdDTO;
  [KafkaTopics.gateway.shutdown]: ActorIdDTO;
  [KafkaTopics.gateway.sendCredentials]: UserCredentialsDTO;

  [KafkaTopics.invitation.restart]: ActorIdDTO;
  [KafkaTopics.invitation.shutdown]: ActorIdDTO;
  [KafkaTopics.invitation.addGuestId]: AddGuestIdToInvitationDTO;
  [KafkaTopics.invitation.deleteInvitations]: UserActionDTO;

  [KafkaTopics.logstream.log]: LogDTO;
  [KafkaTopics.logstream.restart]: ActorIdDTO;
  [KafkaTopics.logstream.shutdown]: ActorIdDTO;

  [KafkaTopics.notification.sendRequestReset]: SendAuthLinkDTO;
  [KafkaTopics.notification.sendMagicLink]: SendAuthLinkDTO;
  [KafkaTopics.notification.notifyUser]: TokenDTO;
  [KafkaTopics.notification.restart]: ActorIdDTO;
  [KafkaTopics.notification.shutdown]: ActorIdDTO;
  [KafkaTopics.notification.confirmGuest]: GuestNotificationDTO;

  [KafkaTopics.seat.create]: CreateSeatDTO;
  [KafkaTopics.seat.delete]: EventActionDTO;
  [KafkaTopics.seat.restart]: ActorIdDTO;
  [KafkaTopics.seat.shutdown]: ActorIdDTO;
  [KafkaTopics.seat.addGuestId]: CreateUserDTO;
  [KafkaTopics.seat.deleteGuestId]: UserIdDTO;

  [KafkaTopics.ticket.restart]: ActorIdDTO;
  [KafkaTopics.ticket.shutdown]: ActorIdDTO;
  [KafkaTopics.ticket.deleteTickets]: UserActionDTO;
  [KafkaTopics.ticket.create]: TokenDTO;

  [KafkaTopics.user.deleteUser]: UserIdDTO;
  [KafkaTopics.user.createUser]: CreateUserDTO;
  [KafkaTopics.user.createGuest]: CreateGuestDTO;
  [KafkaTopics.user.createProviderUser]: CreateUserProviderDTO;
  [KafkaTopics.user.shutdown]: ActorIdDTO;
  [KafkaTopics.user.restart]: ActorIdDTO;
}
