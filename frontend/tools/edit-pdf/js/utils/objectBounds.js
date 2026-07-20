/* ==========================================================
   EDITMEE
   FILE : utils/objectBounds.js
   PURPOSE :
   Convert PDF text objects into screen bounds.
==========================================================*/

export function getObjectBounds(object, viewport) {

    const scale = viewport.scale;

    // Block objects
    if (object.type === "block") {

        const x = object.x * scale;

        const y = viewport.height - (object.y * scale);

        const width = object.width * scale;

        const height = object.height * scale;

        return {

            left: x,
            top: y - height,
            right: x + width,
            bottom: y,
            width,
            height

        };

    }

    // Word objects
    const x = (object.transform[4] + (object.xOffset || 0)) * scale;

    const y = viewport.height - (object.transform[5] * scale);

    const width = object.width * scale;

    const height = object.height * scale;

    return {

        left: x,
        top: y - height,
        right: x + width,
        bottom: y,
        width,
        height

    };

}
/**
 * Check whether a point is inside bounds.
 */
export function containsPoint(bounds, x, y) {

    return (

        x >= bounds.left &&
        x <= bounds.right &&
        y >= bounds.top &&
        y <= bounds.bottom

    );

}