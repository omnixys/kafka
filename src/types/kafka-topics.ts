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
    restart: `admin.restart.address`,
    shutdown: `admin.shutdown.address`,
    createEventAddress: "event.create.address",
    deleteEventAddress: "event.delete.address",
    createUserAddresses: "authentication.create.addresses",
    deleteUserAddresses: "authentication.delete.addresses",
  },

  admin: {
    allRestart: "all.restart.admin",
    allShutdown: "all.shutdown.admin",
  },

  authentication: {
    restart: `admin.restart.authentication`,
    shutdown: `admin.shutdown.authentication`,
  },

  event: {
    restart: `admin.restart.event`,
    shutdown: `admin.shutdown.event`,

    addRole: "authentication.addRole.event",
    removeRoles: "authentication.removeRole.event",
  },

  gateway: {
    restart: `admin.restart.gateway`,
    shutdown: `admin.shutdown.gateway`,

    sendCredentials: "notification.sendCredentials.gateway",
  },

  invitation: {
    restart: `admin.restart.invitation`,
    shutdown: `admin.shutdown.invitation`,
    deleteInvitations: `authentication.delete.invitation`,
    addGuestId: `ticket.addGuestId.invitation`,
  },

  logstream: {
    log: "logstream.log",
    restart: `admin.restart.logstream`,
    shutdown: `admin.shutdown.logstream`,
  },

  notification: {
    restart: `admin.restart.notification`,
    shutdown: `admin.shutdown.notification`,
    // sendCredentials: "authentication.sendCredentials.notification",
    sendRequestReset: "authentication.sendRequestReset.notification",
    sendMagicLink: "authentication.sendMagicLink.notification",

    confirmGuest: "invitation.confirmGuest.notification",
    notifyUser: `authentication.notifyRegistration.notification`,
  },

  seat: {
    restart: `admin.restart.seat`,
    shutdown: `admin.shutdown.seat`,

    create: "event.create.seat",
    delete: "event.delete.seat",

    addGuestId: `user.addGuestId.seat`,
    deleteGuestId: `user.deleteGuestId.seat`,
  },

  ticket: {
    restart: `admin.restart.ticket`,
    shutdown: `admin.shutdown.ticket`,

    deleteTickets: `authentication.delete.ticket`,
    create: `authentication.create.ticket`,
  },

  user: {
    restart: `admin.restart.user`,
    shutdown: `admin.shutdown.user`,
    deleteUser: "authentication.delete.user",
    createUser: "authentication.create.user",
    createGuest: "authentication.createGuest.user",
    createProviderUser: "authentication.provider.user",
  },
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
      typeof value === "string"
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
