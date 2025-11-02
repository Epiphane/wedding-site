import React, { useEffect, useState, useRef, MouseEvent, ChangeEvent } from 'react';
import Moveable from 'react-moveable';
import type {
  OnDrag,
  OnDragEnd,
  OnResize,
  OnResizeEnd,
  OnRotate,
  OnRotateEnd
} from 'react-moveable';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Card from '../components/Card';
import { CanvasItem, FrontendModel } from '../types';

interface CanvasItemProps {
  item: CanvasItem;
  isActive: boolean;
  onClick: () => void;
}

interface CanvasControlsProps {
  model: FrontendModel;
  updateModel: (updater: (prev: FrontendModel) => FrontendModel) => void;
}

export default function CanvasPage(): JSX.Element {
  const { model, updateModel, sendToBackend } = useApp();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const itemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});

  useEffect(() => {
    sendToBackend({ type: 'getCanvas' });
  }, [sendToBackend]);

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    // Only place item if clicking on the canvas background, not on an item
    if ((e.target as HTMLElement).id === 'canvas-background' || (e.target as HTMLElement).id === 'canvas-inner') {
      const innerCanvas = document.getElementById('canvas-inner');
      if (innerCanvas) {
        const rect = innerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        placeItem(x, y);
      }
    }
  };

  const placeItem = (x: number, y: number) => {
    const item: CanvasItem = {
      id: String(Date.now()), // Use timestamp for unique ID
      owner: model.sessionName,
      itemType: model.textInput !== ''
        ? { type: 'textBox', value: model.textInput }
        : { type: 'sticker', value: model.selectedSticker },
      x: x - 25,
      y: y - 25,
      rotation: model.stickerRotation,
      scale: model.stickerScale
    };
    sendToBackend({ type: 'placeCanvasItem', item });
    updateModel(prev => ({
      ...prev,
      textInput: '',
      stickerRotation: 0,
      stickerScale: 1.0
    }));
  };

  const handleDrag = (itemId: string) => (e: OnDrag) => {
    const item = model.canvasItems.find(item => item.id === itemId);
    if (item) {
      const newX = item.x + e.beforeTranslate[0];
      const newY = item.y + e.beforeTranslate[1];

      updateModel(prev => ({
        ...prev,
        canvasItems: prev.canvasItems.map(canvasItem =>
          canvasItem.id === itemId
            ? { ...canvasItem, x: newX, y: newY }
            : canvasItem
        )
      }));

      // Update transform while dragging
      e.target.style.left = `${newX}px`;
      e.target.style.top = `${newY}px`;
    }
  };

  const handleDragEnd = (itemId: string) => (e: OnDragEnd) => {
    if (e.lastEvent) {
      const item = model.canvasItems.find(item => item.id === itemId);
      if (item) {
        sendToBackend({
          type: 'updateCanvasItemPosition',
          itemId: itemId,
          x: item.x,
          y: item.y
        });
      }
    }
  };

  const handleResize = (itemId: string) => (e: OnResize) => {
    const item = model.canvasItems.find(item => item.id === itemId);
    if (item) {
      // Calculate scale based on width (assuming base width of 50px)
      const baseSize = 50;
      const newScale = Math.max(0.5, Math.min(2.0, e.width / baseSize));

      // Update position if dragged during resize
      const newX = e.drag ? item.x + e.drag.beforeTranslate[0] : item.x;
      const newY = e.drag ? item.y + e.drag.beforeTranslate[1] : item.y;

      updateModel(prev => ({
        ...prev,
        canvasItems: prev.canvasItems.map(canvasItem =>
          canvasItem.id === itemId
            ? {
              ...canvasItem,
              x: newX,
              y: newY,
              scale: newScale
            }
            : canvasItem
        )
      }));

      // Update element dimensions
      e.target.style.width = `${e.width}px`;
      e.target.style.height = `${e.height}px`;
      e.target.style.left = `${newX}px`;
      e.target.style.top = `${newY}px`;
    }
  };

  const handleResizeEnd = (itemId: string) => (e: OnResizeEnd) => {
    if (e.lastEvent) {
      const item = model.canvasItems.find(item => item.id === itemId);
      if (item) {
        sendToBackend({
          type: 'updateCanvasItemPosition',
          itemId: itemId,
          x: item.x,
          y: item.y
        });
        sendToBackend({
          type: 'updateCanvasItemScale',
          itemId: itemId,
          scale: item.scale
        });
      }
    }
  };

  const handleRotate = (itemId: string) => (e: OnRotate) => {
    const item = model.canvasItems.find(item => item.id === itemId);
    if (item) {
      // Update position if dragged during rotate
      const newX = e.drag ? item.x + e.drag.beforeTranslate[0] : item.x;
      const newY = e.drag ? item.y + e.drag.beforeTranslate[1] : item.y;

      updateModel(prev => ({
        ...prev,
        canvasItems: prev.canvasItems.map(canvasItem =>
          canvasItem.id === itemId
            ? {
              ...canvasItem,
              x: newX,
              y: newY,
              rotation: e.rotation
            }
            : canvasItem
        )
      }));

      // Update transform
      e.target.style.left = `${newX}px`;
      e.target.style.top = `${newY}px`;
      e.target.style.transform = `rotate(${e.rotation}deg) scale(${item.scale})`;
    }
  };

  const handleRotateEnd = (itemId: string) => (e: OnRotateEnd) => {
    if (e.lastEvent) {
      const item = model.canvasItems.find(item => item.id === itemId);
      if (item) {
        sendToBackend({
          type: 'updateCanvasItemPosition',
          itemId: itemId,
          x: item.x,
          y: item.y
        });
        sendToBackend({
          type: 'updateCanvasItemRotation',
          itemId: itemId,
          rotation: item.rotation
        });
      }
    }
  };

  return (
    <div>
      <Header
        weddingDate={model.weddingDate}
        venue={model.venue}
        coupleNames={model.coupleNames}
      />
      <NavigationBar isAuthenticated={model.isAuthenticated} />

      <div
        style={{
          maxWidth: '1400px',
          margin: '40px auto',
          padding: '20px'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '20px',
            alignItems: 'start'
          }}
        >
          <CanvasControls model={model} updateModel={updateModel} />
          <div
            id="canvas-background"
            onClick={handleCanvasClick}
            style={{
              background: '#aaa',
              width: '100%',
              minHeight: '600px',
              padding: '30px',
              position: 'relative',
              cursor: 'crosshair'
            }}
          >
            <div
              id="canvas-inner"
              onClick={(e: MouseEvent<HTMLDivElement>) => {
                if ((e.target as HTMLElement).id === 'canvas-inner') {
                  setActiveItemId(null);
                  handleCanvasClick(e);
                }
              }}
              style={{
                background: '#fff',
                width: '800px',
                height: '800px',
                margin: 'auto',
                position: 'relative'
              }}
            >
              {model.canvasItems.map(item => {
                if (!itemRefs.current[item.id]) {
                  itemRefs.current[item.id] = React.createRef<HTMLDivElement>();
                }
                const itemRef = itemRefs.current[item.id];

                return (
                  <React.Fragment key={item.id}>
                    <CanvasItemComponent
                      ref={itemRef}
                      item={item}
                      isActive={activeItemId === item.id}
                      onClick={() => setActiveItemId(item.id)}
                    />
                    {activeItemId === item.id && itemRef.current && (
                      <Moveable
                        target={itemRef.current}
                        container={document.getElementById('canvas-inner')}
                        draggable={true}
                        resizable={true}
                        rotatable={true}
                        scalable={false}
                        keepRatio={false}
                        throttleDrag={0}
                        throttleResize={0}
                        throttleRotate={0}
                        edge={false}
                        origin={false}
                        onDrag={handleDrag(item.id)}
                        onDragEnd={handleDragEnd(item.id)}
                        onResize={handleResize(item.id)}
                        onResizeEnd={handleResizeEnd(item.id)}
                        onRotate={handleRotate(item.id)}
                        onRotateEnd={handleRotateEnd(item.id)}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const CanvasItemComponent = React.forwardRef<HTMLDivElement, CanvasItemProps>(
  ({ item, isActive, onClick }, ref) => {
    const content = item.itemType.type === 'sticker' ? item.itemType.value : item.itemType.value;
    const fontSize = item.itemType.type === 'sticker' ? '48px' : '18px';

    return (
      <div
        ref={ref}
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          onClick();
        }}
        style={{
          position: 'absolute',
          left: `${item.x}px`,
          top: `${item.y}px`,
          transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
          transformOrigin: 'center center',
          fontSize: fontSize,
          fontFamily: "'Georgia', 'Times New Roman', serif",
          whiteSpace: 'pre-wrap',
          maxWidth: '300px',
          cursor: 'move',
          userSelect: 'none',
          padding: '4px',
          border: isActive ? '2px solid #4af' : 'none',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {content}
      </div>
    );
  }
);

CanvasItemComponent.displayName = 'CanvasItem';

function CanvasControls({ model, updateModel }: CanvasControlsProps): JSX.Element {
  const stickers = [
    '❤️', '💕', '💝', '💖', '💗', '💓', '💞', '💘', '🎉', '🎊', '🎈', '🎁',
    '🌸', '🌹', '🌺', '🌻', '⭐', '✨', '💫', '🌟', '👰', '🤵', '💍', '🥂'
  ];

  const handleSelectSticker = (sticker: string) => {
    updateModel(prev => ({ ...prev, selectedSticker: sticker }));
  };

  const handleTextInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, 140);
    updateModel(prev => ({ ...prev, textInput: text }));
  };

  const handleRotation = (e: ChangeEvent<HTMLInputElement>) => {
    updateModel(prev => ({ ...prev, stickerRotation: parseFloat(e.target.value) }));
  };

  const handleScale = (e: ChangeEvent<HTMLInputElement>) => {
    const scale = Math.max(0.5, Math.min(2.0, parseFloat(e.target.value)));
    updateModel(prev => ({ ...prev, stickerScale: scale }));
  };

  return (
    <div>
      <Card style={{ marginBottom: '20px' }}>
        <h3
          style={{
            marginTop: '0',
            color: '#333',
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}
        >
          Add Sticker
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto auto auto',
            gap: '8px'
          }}
        >
          {stickers.map(sticker => (
            <button
              key={sticker}
              onClick={() => handleSelectSticker(sticker)}
              style={{
                fontSize: '2em',
                padding: '10px',
                border: model.selectedSticker === sticker ? '3px solid #333' : '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {sticker}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '20px' }}>
        <h3
          style={{
            marginTop: '0',
            color: '#333',
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}
        >
          Add Text
        </h3>
        <textarea
          value={model.textInput}
          onChange={handleTextInput}
          placeholder="Enter text (max 140 characters)"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '2px',
            fontSize: '1em',
            boxSizing: 'border-box',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            resize: 'vertical',
            minHeight: '80px'
          }}
        />
        <p
          style={{
            margin: '5px 0 0 0',
            fontSize: '0.85em',
            color: '#999',
            textAlign: 'right'
          }}
        >
          {model.textInput.length} / 140
        </p>
      </Card>

      <Card>
        <h3
          style={{
            marginTop: '0',
            color: '#333',
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}
        >
          Customize
        </h3>
        <div style={{ marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              color: '#666'
            }}
          >
            Rotation: {Math.round(model.stickerRotation)}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={model.stickerRotation}
            onChange={handleRotation}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              color: '#666'
            }}
          >
            Scale: {Math.round(model.stickerScale * 10) / 10}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={model.stickerScale}
            onChange={handleScale}
            style={{ width: '100%' }}
          />
        </div>
        <p
          style={{
            marginTop: '15px',
            color: '#666',
            fontSize: '0.9em'
          }}
        >
          Click anywhere on the canvas to place your sticker or text! Click on items to select and manipulate them.
        </p>
      </Card>
    </div>
  );
}
