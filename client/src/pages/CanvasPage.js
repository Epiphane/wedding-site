import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Card from '../components/Card';

export default function CanvasPage() {
  const { model, updateModel, sendToBackend } = useApp();
  const [name1, name2] = model.coupleNames;
  const [activeItemId, setActiveItemId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    sendToBackend({ type: 'getCanvas' });
  }, [sendToBackend]);

  const handleCanvasClick = (e) => {
    const innerCanvas = e.currentTarget.querySelector('[style*="800px"]');
    if (innerCanvas && (e.target === innerCanvas || e.target.id === 'canvas-background')) {
      const rect = innerCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      placeItem(x, y);
    }
  };

  const placeItem = (x, y) => {
    const item = {
      id: String(model.canvasItems.length),
      owner: model.sessionName,
      itemType: model.textInput !== '' ? { type: 'textBox', value: model.textInput } : { type: 'sticker', value: model.selectedSticker },
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

  const handleItemMouseDown = (e, itemId) => {
    e.stopPropagation();
    setActiveItemId(itemId);
    const item = model.canvasItems.find(item => item.id === itemId);
    if (item) {
      setDragging(true);
      const rect = e.currentTarget.parentElement.getBoundingClientRect();
      setDragStart({
        offsetX: e.clientX - rect.left - item.x,
        offsetY: e.clientY - rect.top - item.y,
        itemX: item.x,
        itemY: item.y
      });
    }
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      if (activeItemId && dragStart) {
        const canvasEl = document.getElementById('canvas-background');
        if (canvasEl) {
          const innerCanvas = canvasEl.querySelector('[style*="800px"]');
          if (innerCanvas) {
            const rect = innerCanvas.getBoundingClientRect();
            const newX = e.clientX - rect.left - dragStart.offsetX;
            const newY = e.clientY - rect.top - dragStart.offsetY;
            updateItemTransform(activeItemId, newX, newY, null, null);
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (activeItemId) {
        updateModel(prev => {
          const item = prev.canvasItems.find(item => item.id === activeItemId);
          if (item) {
            sendToBackend({
              type: 'updateCanvasItemPosition',
              itemId: activeItemId,
              x: item.x,
              y: item.y
            });
          }
          return prev;
        });
      }
      setDragging(false);
      setActiveItemId(null);
      setDragStart(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, activeItemId, dragStart]);

  const updateItemTransform = (itemId, x, y, rotation, scale) => {
    updateModel(prev => ({
      ...prev,
      canvasItems: prev.canvasItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              ...(x !== null && y !== null ? { x, y } : {}),
              ...(rotation !== null ? { rotation } : {}),
              ...(scale !== null ? { scale } : {})
            }
          : item
      )
    }));
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
              style={{
                background: '#fff',
                width: '800px',
                height: '800px',
                margin: 'auto',
                position: 'relative'
              }}
            >
              {model.canvasItems.map(item => (
                <CanvasItem
                  key={item.id}
                  item={item}
                  isActive={activeItemId === item.id}
                  onMouseDown={(e) => handleItemMouseDown(e, item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function CanvasItem({ item, isActive, onMouseDown }) {
  const content = item.itemType.type === 'sticker' ? item.itemType.value : item.itemType.value;
  const fontSize = item.itemType.type === 'sticker' ? '48px' : '18px';

  return (
    <div
      onMouseDown={onMouseDown}
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
        border: isActive ? '2px solid #4af' : 'none'
      }}
    >
      {content}
    </div>
  );
}

function CanvasControls({ model, updateModel }) {
  const stickers = [
    '❤️', '💕', '💝', '💖', '💗', '💓', '💞', '💘', '🎉', '🎊', '🎈', '🎁',
    '🌸', '🌹', '🌺', '🌻', '⭐', '✨', '💫', '🌟', '👰', '🤵', '💍', '🥂'
  ];

  const handleSelectSticker = (sticker) => {
    updateModel(prev => ({ ...prev, selectedSticker: sticker }));
  };

  const handleTextInput = (e) => {
    const text = e.target.value.slice(0, 140);
    updateModel(prev => ({ ...prev, textInput: text }));
  };

  const handleRotation = (e) => {
    updateModel(prev => ({ ...prev, stickerRotation: parseFloat(e.target.value) }));
  };

  const handleScale = (e) => {
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
          Click anywhere on the canvas to place your sticker or text!
        </p>
      </Card>
    </div>
  );
}
