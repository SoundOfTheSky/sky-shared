export enum WebSocketMessageType {
  REQUEST,
  SUBSCRIBE,
  UNSUBSCRIBE,
  RESPONSE,
  SUBSCRIBE_VALUE,
  ERROR,
}

export type WebSocketMessageClient = {
  id: number
  type:
    | WebSocketMessageType.REQUEST
    | WebSocketMessageType.SUBSCRIBE
    | WebSocketMessageType.UNSUBSCRIBE
  url: string
  value?: unknown
}

export type WebSocketMessageResponse = {
  id: number
  type: WebSocketMessageType.RESPONSE
  value: unknown
}

export type WebSocketMessageSubscribeValue = {
  id: number
  type: WebSocketMessageType.SUBSCRIBE_VALUE
  value: unknown
  done?: boolean
}

export type WebSocketMessageError = {
  id: number
  type: WebSocketMessageType.ERROR
  value: Error
}

export type WebSocketMessageServer =
  | WebSocketMessageResponse
  | WebSocketMessageSubscribeValue
  | WebSocketMessageError
