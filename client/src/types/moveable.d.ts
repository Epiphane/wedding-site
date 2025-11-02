// Type definitions for react-moveable events
export interface MoveableDragEvent {
  target: HTMLElement;
  beforeTranslate: [number, number];
  translate: [number, number];
}

export interface MoveableDragEndEvent {
  lastEvent?: MoveableDragEvent;
}

export interface MoveableResizeEvent {
  target: HTMLElement;
  width: number;
  height: number;
  drag?: {
    beforeTranslate: [number, number];
  };
}

export interface MoveableResizeEndEvent {
  lastEvent?: MoveableResizeEvent;
}

export interface MoveableRotateEvent {
  target: HTMLElement;
  rotation: number;
  drag?: {
    beforeTranslate: [number, number];
  };
}

export interface MoveableRotateEndEvent {
  lastEvent?: MoveableRotateEvent;
}
