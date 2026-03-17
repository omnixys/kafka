/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Central Kafka topic registry for the Omnixys platform.
 *
 * This file defines all Kafka topics used across services.
 * Topics are organized by domain to keep the event system
 * consistent and type-safe.
 */

/**
 * Global Kafka topic registry.
 *
 * Structure:
 * domain → action → topic name
 *
 * Example topic:
 * ticket.delete.user
 */
export const KafkaTopics = {
  address: {
    createEventAddress: "event.create.address",
    deleteEventAddress: "event.delete.address",
    createUserAddresses: "authentication.create.addresses",
    deleteUserAddresses: "authentication.delete.addresses",
  },
  authentication: {},
  event: {
    // addGuest: 'ticket.addGuest.event',
    // addRole: 'authentication.addRole.event',
    // restartEvent: 'event.restart.admin',
    // shutdownEvent: 'event.shutdown.admin',
  },
  logstream: {
    authentication: "authentication.send.logstream",
    event: "event.send.logstream",
    seat: "seat.send.logstream",
  },
  notification: {
    sendCredentials: "authentication.sendCredentials.notification",
    sendRequestReset: "authentication.sendRequestReset.notification",
    sendMagicLink: "authentication.sendMagicLink.notification",
  },
  seat: {
    create: "event.create.seat",
    delete: "event.delete.seat",
  },
  ticket: {
    // createTicket: "authentication.create.ticket",
  },
  user: {
    // createUser: "authentication.create.user",
    // updateUser: "authentication.update.user",
    deleteUser: "authentication.delete.user",
    addId: "authentication.id.user",
    createProviderUser: "authentication.provider.user",
  },
  // admin: {
  //   allRestart: 'all.restart.admin',
  //   allShutdown: 'all.shutdown.admin',
  // },
} as const;

/**
 * Type representation of the KafkaTopics structure.
 */
export type KafkaTopicsType = typeof KafkaTopics;

/**
 * Returns all Kafka topics defined in the registry.
 * Useful for consumer subscriptions.
 */
export function getAllKafkaTopics(): string[] {
  const flatten = (obj: Record<string, unknown>): string[] =>
    Object.values(obj).flatMap((value) =>
      typeof value === 'string'
        ? [value]
        : flatten(value as Record<string, unknown>),
    );

  return flatten(KafkaTopics);
}

/**
 * Returns a specific topic by domain and key.
 *
 * Example:
 * getTopic('invitation', 'deleteInvitation')
 */
export function getTopic<
  D extends keyof KafkaTopicsType,
  K extends keyof KafkaTopicsType[D],
>(domain: D, key: K): KafkaTopicsType[D][K] {
  return KafkaTopics[domain][key];
}
