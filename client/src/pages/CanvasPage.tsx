import React, { useEffect, ChangeEvent, MouseEventHandler, TouchEventHandler } from 'react';
import Moveable from 'react-moveable';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Card from '../components/Card';
import { FrontendModel } from '../types';
import throttle from "lodash/throttle";
import Sticker from '../../../server/model/sticker';

interface CanvasItemProps extends React.HTMLAttributes<HTMLDivElement> {
    item: Sticker;
}

interface CanvasControlsProps {
    model: FrontendModel;
    updateModel: (updater: (prev: FrontendModel) => FrontendModel) => void;
    onClear: () => void;
}

export default function CanvasPage(): JSX.Element {
    const { model, guestInfo, updateModel, sendToBackend, canvas, setCanvas, clearCanvas } = useApp();
    const moveableRef = React.useRef<Moveable>(null);
    const [target, setTarget] = React.useState<string>("");
    const targetItem = () => {
        const parts = target.split('-');
        return parts.length === 2 && parts[0] === '#sticker' ? +parts[1] : -1;
    }

    const placeItem = (x: number, y: number) => {
        const item: Partial<Sticker> = {
            id: Date.now().valueOf(), // Use timestamp for unique ID
            type: model.textInput !== '' ? 'text' : 'image',
            content: model.textInput || model.selectedSticker,
            x: x - 25,
            y: y - 25,
            rotation: model.stickerRotation,
            scale: model.stickerScale
        };
        sendToBackend('placeSticker', item);
        updateModel(prev => ({
            ...prev,
            textInput: '',
            stickerRotation: 0,
            stickerScale: 1.0
        }));
    };

    const updateCurrentItem = (updateFn: (item: Sticker) => Partial<Sticker>) => {
        const currentItemId = targetItem();
        const newCanvas = canvas.map(canvasItem => canvasItem.id === currentItemId ? updateFn(canvasItem) as Sticker : canvasItem);
        setCanvas(newCanvas);
    }

    const saveCurrentItem = () => {
        const currentItemId = targetItem();
        const item = canvas.find(item => item.id === currentItemId);
        if (item) {
            sendToBackend('updateSticker', item);
        }
    }

    // const throttleFunction = (callback: Function, frequency: number) => {
    const ref = React.useRef<Function>();

    useEffect(() => {
        ref.current = saveCurrentItem;
    }, [saveCurrentItem]);

    const throttleSave = React.useMemo(() => {
        const func = () => {
            ref.current?.();
        };

        return throttle(func, 100);
    }, []);

    //     return debouncedCallback;
    // };

    // const throttleSave = throttleFunction(saveCurrentItem, 1000);

    const handleTouchMove = (e: TouchEvent) => {
        // console.log(e);
    }

    const handlePinch = (e: any) => {
        console.log(e);
    }

    const containerRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // This prevents the default pull-to-refresh behavior
        // container.addEventListener('touchmove', handleTouchMove, { passive: false });

        // Prevent zooming with more than one finger
        container.addEventListener('touchstart', function (e) {
            console.log(e);
            if (e.touches.length > 1) {
                e.preventDefault(); // Prevent zoom
            }
        }, { passive: false });

        // Prevent pinch zooming with gestures
        container.addEventListener('gesturestart', function (e) {
            console.log(e);
            e.preventDefault(); // Prevent zoom gesture
        }, { passive: false });

        return () => {
            container.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

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
                <div className="canvas-page">
                    <CanvasControls model={model} updateModel={updateModel} onClear={clearCanvas} />
                    <div
                        ref={containerRef}
                        id="canvas-background"
                        onMouseUp={e => {
                            const moveable = moveableRef.current;
                            if (!moveable || moveable.isDragging()) {
                                return;
                            }
                            // Only place item if clicking on the canvas background, not on an item
                            if ((e.target as HTMLElement).id === 'canvas-background') {
                                const innerCanvas = document.getElementById('canvas-background');
                                if (innerCanvas) {
                                    const rect = innerCanvas.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;
                                    placeItem(x, y);
                                }
                            }
                        }}
                        style={{
                            background: '#eee',
                            width: '100%',
                            minHeight: '600px',
                            padding: '30px',
                            position: 'relative',
                            cursor: 'crosshair'
                        }}
                    >
                        <Moveable
                            ref={moveableRef}
                            target={target}
                            container={document.getElementById('canvas-inner')}
                            draggable={true}
                            rotatable={true}
                            scalable={true}
                            keepRatio={true}
                            edge={true}
                            origin={false}
                            onDrag={e => {
                                updateCurrentItem(item => ({
                                    ...item,
                                    x: e.translate[0],
                                    y: e.translate[1],
                                }));
                                throttleSave();
                            }}
                            onDragEnd={saveCurrentItem}
                            onScale={e => {
                                updateCurrentItem(item => ({
                                    ...item,
                                    x: e.drag.beforeTranslate[0],
                                    y: e.drag.beforeTranslate[1],
                                    scale: e.scale[0]
                                }));
                                throttleSave();
                            }}
                            onScaleEnd={saveCurrentItem}
                            onRotate={e => {
                                updateCurrentItem(item => ({
                                    ...item,
                                    rotation: e.rotation
                                }));
                                throttleSave();
                            }}
                            onRotateEnd={saveCurrentItem}
                        />
                        {canvas.map(item => {
                            const handleTouchStart = (e: React.MouseEvent | React.TouchEvent) => {
                                const moveable = moveableRef.current;
                                if (moveable && !moveable.isDragging()) {
                                    setTarget(`#sticker-${item.id}`)
                                    moveable.waitToChangeTarget().then(() => {
                                        moveable.dragStart(e.nativeEvent);
                                    });
                                }
                            }
                            return (
                                <React.Fragment key={item.id}>
                                    <CanvasItemComponent
                                        id={`sticker-${item.id}`}
                                        item={item}
                                        onTouchStart={handleTouchStart}
                                        onMouseDown={handleTouchStart}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

const CanvasItemComponent = React.forwardRef<HTMLDivElement, CanvasItemProps>(
    ({ item, ...props }, ref) => {
        const content = item.content;
        const fontSize = item.type === 'image' ? '48px' : '18px';

        return (
            <div
                ref={ref}
                {...props}
                style={{
                    position: 'absolute',
                    transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`,
                    transformOrigin: 'center center',
                    fontSize: fontSize,
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    whiteSpace: 'pre-wrap',
                    maxWidth: '300px',
                    cursor: 'move',
                    userSelect: 'none',
                    lineHeight: '1',
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

function CanvasControls({ model, updateModel, onClear }: CanvasControlsProps): JSX.Element {
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
        <div className="canvas-controls">
            <Card style={{ marginBottom: '20px' }}>
                <button
                    style={{
                        marginTop: '0',
                        color: '#333',
                        fontFamily: "'Georgia', 'Times New Roman', serif"
                    }}
                    onClick={onClear}
                >
                    Clear
                </button>
            </Card>

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
