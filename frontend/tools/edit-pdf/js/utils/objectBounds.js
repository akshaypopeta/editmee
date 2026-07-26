/* ==========================================================
   EDITMEE
   FILE : utils/objectBounds.js
   PURPOSE :
   Convert PDF objects into screen bounds.
==========================================================*/

export function getObjectBounds(object, viewport) {

    const scale = viewport.scale;

    // ==========================================
    // Paragraph Block
    // ==========================================
    if (object.type === "block") {

        // Use calculated paragraph bounds
        if (object.bounds) {

            return {

                left: object.bounds.left * scale,

                top:
                    viewport.height -
                    (object.bounds.bottom * scale),

                right:
                    object.bounds.right * scale,

                bottom:
                    viewport.height -
                    (object.bounds.top * scale),

                width:
                    object.bounds.width * scale,

                height:
                    object.bounds.height * scale

            };

        }

        // ------------------------------------
        // Fallback (old behaviour)
        // ------------------------------------

        const x = object.x * scale;

        const y =
            viewport.height -
            (object.y * scale);

        const width =
            object.width * scale;

        const height =
            object.height * scale;

        return {

            left: x,

            top: y - height,

            right: x + width,

            bottom: y,

            width,

            height

        };

    }

    // ==========================================
    // Word Object
    // ==========================================

    const x =
        (object.transform[4] +
            (object.xOffset || 0))
        * scale;

    const y =
        viewport.height -
        (object.transform[5] * scale);

    const width =
        object.width * scale;

    const height =
        object.height * scale;

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
 * Check whether point lies inside bounds.
 */
export function containsPoint(bounds, x, y) {

    return (

        x >= bounds.left &&
        x <= bounds.right &&
        y >= bounds.top &&
        y <= bounds.bottom

    );

}