import { Resend } from "resend";
import { env } from "../../../config/env";
import type { EmailMessage, EmailProvider } from "./types";

const formatAddress = (address: { email: string; name?: string }): string =>
  address.name ? `${address.name} <${address.email}>` : address.email;

export class ResendProvider implements EmailProvider {
  private readonly client: Resend;

  constructor(apiKey: string = env.RESEND_API_KEY) {
    this.client = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    const { data, error } = await this.client.emails.send({
      from: formatAddress(message.from),
      to: message.to.map(formatAddress),
      subject: message.subject,
      html: message.html,
      ...(message.text ? { text: message.text } : {}),
    });

    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("Resend send returned no data");
    }
  }
}