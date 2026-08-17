import 'node:stream/web';

type NodeUnderlyingSource<R> = import('node:stream/web').UnderlyingSource<R>;

declare module 'node:stream/web' {
  /**
   * Happy DOM 20.11 references the DOM name for the non-byte overload while
   * Node 24 exposes the equivalent shape as UnderlyingSource.
   */
  interface UnderlyingDefaultSource<
    R = unknown,
  > extends NodeUnderlyingSource<R> {}
}
