/**
 * @file This file contains a utility function for producing and sending events to Inngest.
 * @requires @ai_pair_programmer/inngest
 */
import { inngest } from "@ai_pair_programmer/inngest";

/**
 * Sends an event to the Inngest service.
 * This function is a wrapper around `inngest.send` to handle event production
 * with logging and error handling.
 * @param {object} params - The parameters for the event.
 * @param {string} params.name - The name of the event to send.
 * @param {string} params.id - The unique ID for this event instance.
 * @param {any | null} params.data - The payload data for the event.
 * @returns {Promise<void>} A promise that resolves when the event has been sent, or rejects on error.
 */
export const produceEvent = async ({
  name,
  id,
  data,
}: {
  name: string;
  id: string;
  data: any | null;
}) => {
  try {
    await inngest.send({
      name,
      id,
      data,
    });
    console.log("Event sent to Inngest");
  } catch (error) {
    console.error("Failed to send event to Inngest:", error);
  }
};
