import { inngest } from "@repo/inngest";

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
