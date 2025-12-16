import Sticker from "../../../server/model/sticker";
import { StickerId, StickerProps } from "../../../shared/types";

export type CanvasState = Sticker[];
export type CanvasAction =
  { type: 'set', items: Sticker[] } |
  { type: 'add', item: Sticker } |
  { type: 'replace', item: Sticker } |
  { type: 'update', id: StickerId, props: Partial<StickerProps> } |
  { type: 'remove', item: StickerId } |
  { type: 'clear' };

function equals(itemA: StickerId, itemB: StickerId) {
  return itemA.id === itemB.id && itemA.ownerId === itemB.ownerId
}

export default function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'set':
      return action.items;

    case "add":
      const item = action.item;
      if (state.some(other => other.id === item.id)) {
        console.log('WARN: Skipping duplicate addSticker command');
        return state;
      }
      return [...state, action.item];

    case "replace":
      return state.map(item => {
        if (!equals(item, action.item)) {
          return item;
        }
        return { ...item, ...action.item } as Sticker;
      });

    case "update":
      return state.map(item => {
        if (!equals(item, action.id)) {
          return item;
        }
        return { ...item, ...action.props } as Sticker;
      });

    case "remove":
      return state.filter(item => !equals(item, action.item));

    case "clear":
      return [];
  }
}
