import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: process.env.INNGEST_APP_ID || "aipp", // unique app id
  // Production event key is read from INNGEST_EVENT_KEY env var automatically by SDK,
  // or you can pass eventKey: process.env.INNGEST_EVENT_KEY (not recommended to hardcode).
});
