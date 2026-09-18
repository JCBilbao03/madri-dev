declare module 'mailparser' {
  export interface EmailAddress {
    name?: string;
    address?: string;
  }

  export interface AddressObject {
    value?: EmailAddress[];
    html?: string;
    text?: string;
  }

  export interface ParsedMail {
    messageId?: string;
    inReplyTo?: string;
    references?: string | string[];
    subject?: string;
    date?: Date;
    from?: AddressObject;
    to?: AddressObject | AddressObject[];
    cc?: AddressObject | AddressObject[];
    text?: string;
    html?: string | false;
  }

  export function simpleParser(source: Buffer | string): Promise<ParsedMail>;
}
