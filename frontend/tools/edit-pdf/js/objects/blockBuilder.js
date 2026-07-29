/* ==========================================================
   EDITMEE
   FILE : objects/blockBuilder.js
   PURPOSE :
   Build editable text blocks from extracted PDF text objects.
==========================================================*/

export default class BlockBuilder {

 build(pageObjects) {

    const blocks = [];

    let id = 1;

    const LINE_TOLERANCE = 4;

    const PARAGRAPH_GAP = 18;

    let currentBlock = null;

    const finishBlock = () => {

        if (!currentBlock) return;

        let minX = Number.MAX_VALUE;
        let maxX = 0;

        let minTop = Number.MAX_VALUE;
        let maxBottom = 0;

        for (const obj of currentBlock.objects) {

            const x = obj.transform[4];

            const y = obj.transform[5];

            const w = obj.width;

            const ascent = obj.fontHeight || obj.height;

            minX = Math.min(minX, x);

            maxX = Math.max(maxX, x + w);

            minTop = Math.min(minTop, y - ascent);
maxBottom = Math.max(maxBottom, y);

        }

        currentBlock.x = minX;

        currentBlock.y = maxBottom;

        currentBlock.width = maxX - minX;

        currentBlock.height = maxBottom - minTop;

        currentBlock.bounds = {

            left: minX,

            top: minTop,

            right: maxX,

            bottom: maxBottom,

            width: maxX - minX,

            height: maxBottom - minTop

        };

        blocks.push(currentBlock);

    };

    for (const object of pageObjects) {

        if (object.type !== "text") continue;

        const text = object.text.trim();

        if (!text) continue;

        const x = object.transform[4];

        const y = object.transform[5];

        if (!currentBlock) {

            currentBlock = {

                id: id++,

                type: "block",

                page: object.page,

                x,

                y,

                width: object.width,

                height: object.height,

                fontSize: object.fontHeight,

                fontWidth: object.fontSize || object.width,

                fontName: object.fontName || "",

fontFamily: object.fontFamily || "Arial",

fontWeight: object.fontWeight || "normal",

fontStyle: object.fontStyle || "normal",

color: object.color || "#000000",

lineHeight: object.lineHeight || 1.2,

                text,

                objects: [object],

                selected: false,

                editing: false,

                edited: false,

                visible: true

            };

            continue;

        }

        const prev =
            currentBlock.objects[
                currentBlock.objects.length - 1
            ];

        const prevX = prev.transform[4];

        const prevY = prev.transform[5];

        const sameLine =
            Math.abs(prevY - y)
            <= LINE_TOLERANCE;

        const nextLine =
            y < prevY &&
            Math.abs(prevY - y)
            < PARAGRAPH_GAP;

        if (sameLine) {

            currentBlock.text += " " + text;

            currentBlock.objects.push(object);

            continue;

        }

        if (nextLine) {

            currentBlock.text += "\n" + text;

            currentBlock.objects.push(object);

            continue;

        }

        finishBlock();

        currentBlock = {

            id: id++,

            type: "block",

            page: object.page,

            x,

            y,

            width: object.width,

            height: object.height,

            fontSize: object.fontHeight || object.height,

            fontWidth: object.fontSize || object.width,

            fontName: object.fontName || "",

            fontFamily: object.fontName || "Arial",

            fontWeight: "normal",

            fontStyle: "normal",

            color: "#000000",

            lineHeight: 1.2,

            text,

            objects: [object],

            selected: false,

            editing: false,

            edited: false,

            visible: true

        };

    }

    finishBlock();

    return blocks;

}

}