import { browser } from "@ext/utils/browser";
import { parseMessage } from "@ext/messaging/schema";
import {
  fail,
  ok,
  type ExtensionMessage,
  type MessageType,
  type ResponseMap,
  type Result,
} from "@ext/messaging/types";

/**
 * Typed message bus. `sendMessage` is used by popup/options/content; the
 * background registers handlers via `registerHandlers`. Every inbound message
 * is schema-validated; unknown types are answered with a safe failure result
 * (never thrown, never executed).
 */
export async function sendMessage<T extends MessageType>(
  message: Extract<ExtensionMessage, { type: T }>,
): Promise<Result<ResponseMap[T]>> {
  try {
    const response = (await browser.runtime.sendMessage(message)) as
      | Result<ResponseMap[T]>
      | undefined;
    if (!response || typeof response !== "object" || !("ok" in response)) {
      return fail("no_response");
    }
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "send_failed");
  }
}

export type MessageHandlers = {
  [T in MessageType]: (message: Extract<ExtensionMessage, { type: T }>) => Promise<ResponseMap[T]>;
};

/**
 * Wire the background listener. Validates, dispatches to the matching handler,
 * and always resolves with a Result envelope. Returning a Promise from the
 * listener tells the runtime to keep the message channel open for the reply.
 */
export function registerHandlers(handlers: Partial<MessageHandlers>): void {
  browser.runtime.onMessage.addListener((raw: unknown): Promise<Result<unknown>> => {
    const message = parseMessage(raw);
    if (!message) return Promise.resolve(fail("invalid_message"));

    const handler = handlers[message.type] as
      | ((message: ExtensionMessage) => Promise<unknown>)
      | undefined;
    if (!handler) return Promise.resolve(fail("unknown_message"));

    return handler(message)
      .then((data) => ok(data))
      .catch((error: unknown) => fail(error instanceof Error ? error.message : "handler_error"));
  });
}
