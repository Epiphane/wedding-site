/* elm-pkg-js
port initMoveable : String -> Cmd msg
*/

exports.init = async function (app) {
    /*
    app.ports.initMoveable.subscribe(function (elements) {
        return;
        setTimeout(() => {

            for (let id of elements) {
                window.str = `[data-moveable-id='${id}']`;
                console.log('initializing ', id, window.str)
                const el = document.querySelector(window.str);
                window.el = el;
                console.log(el);
                if (!el) continue;
                const moveable = new Moveable(el.parentElement, {
                    target: el,
                    // If the container is null, the position is fixed. (default: parentElement(document.body))
                    container: el.parentElement,
                    draggable: true,
                    resizable: true,
                    scalable: true,
                    rotatable: true,
                    warpable: true,
                    // Enabling pinchable lets you use events that
                    // can be used in draggable, resizable, scalable, and rotateable.
                    pinchable: true, // ["resizable", "scalable", "rotatable"]
                    origin: true,
                    keepRatio: true,
                    // Resize, Scale Events at edges.
                    edge: false,
                    throttleDrag: 0,
                    throttleResize: 0,
                    throttleScale: 0,
                    throttleRotate: 0,
                });
                console.log(moveable)
                moveable.on("dragStart", ({ target, clientX, clientY }) => {
                    console.log("onDragStart", target);
                }).on("drag", ({
                    target, transform,
                    left, top, right, bottom,
                    beforeDelta, beforeDist, delta, dist,
                    clientX, clientY,
                }) => {
                    console.log("onDrag left, top", left, top);
                    //target!.style.left = `${left}px`;
                    //target!.style.top = `${top}px`;
                    // console.log("onDrag translate", dist);
                    // target!.style.transform = transform;
                }).on("dragEnd", ({ target, isDrag, clientX, clientY }) => {
                    console.log("onDragEnd", target, isDrag);
                });
            }
        }, 10);
    })
    */
}
