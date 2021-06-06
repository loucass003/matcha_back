import { SSE } from "..";
import { SSEChannel, SSEPacket } from "../commons/types/sse";
import { AppRequest } from "../types";

export function sendPacket<T extends SSEPacket>(
  channel: SSEChannel,
  packet: T,
  to?: number[]
) {
  if (!to) {
    SSE.send("message", packet, SSE.findClients(channel));
  } else {
    SSE.send(
      "message",
      packet,
      SSE.connections.filter((conn) => {
        const { session } = conn.req as AppRequest;
        return channel === conn.channel && session && to.includes(session.id);
      })
    );
  }
}
