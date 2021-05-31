import sendgrid from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "..";

export enum MailTemplateType {
  Activation = "d-878484b4d48d48989edf0bf760086202",
}

export interface MailTemplate<> {
  templateId: string;
}

export interface ActivationMail extends MailTemplate {
  firstname: string;
  activationToken: string;
}

export function sendMail<T extends MailTemplate>(
  { templateId, ...fields }: T,
  to: string,
  subject: string
) {
  sendgrid.setApiKey(SENDGRID_API_KEY);
  sendgrid.send({
    to,
    from: "matcha@llelievr.dev",
    subject,
    templateId,
    dynamicTemplateData: { ...fields },
  });
}
