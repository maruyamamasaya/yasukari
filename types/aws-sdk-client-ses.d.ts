declare module '@aws-sdk/client-ses' {
  export class SESClient {
    constructor(config: { region: string });
    send(command: unknown): Promise<void>;
  }

  export class SendEmailCommand {
    constructor(input: unknown);
  }
}
