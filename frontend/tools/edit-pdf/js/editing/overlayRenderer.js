/* ==========================================================
   EDITMEE
   FILE : editing/overlayRenderer.js
   PURPOSE :
   Draw edited PDF text above the rendered PDF page.
==========================================================*/

export default class OverlayRenderer {

    constructor(pageManager, objectManager) {

        this.pageManager = pageManager;
        this.objectManager = objectManager;

    }

  drawPage(pageNumber) {

    const pageState = this.pageManager.getPage(pageNumber);

    if (!pageState) return;

    const ctx = pageState.selectionContext;

    const viewport = pageState.viewport;

    const blocks =
        this.objectManager.getBlockObjects(pageNumber);

    ctx.clearRect(
        0,
        0,
        pageState.selectionCanvas.width,
        pageState.selectionCanvas.height
    );

    for (const block of blocks) {

        if (!block.edited) continue;

        const x = block.x * viewport.scale;

        const top =
    block.bounds
        ? viewport.height -
          (block.bounds.bottom * viewport.scale)
        : viewport.height -
          (block.y * viewport.scale);

        const maxWidth =
            block.width * viewport.scale;

        const fontSize =
            (block.fontSize || block.height) *
            viewport.scale;

        ctx.save();

        ctx.font =
            `${block.fontStyle || "normal"} ` +
            `${block.fontWeight || "normal"} ` +
            `${fontSize}px ` +
            `${block.fontFamily || "Arial"}`;

        ctx.fillStyle =
            block.color || "#000";

        ctx.textBaseline = "top";

        const lineHeight =
    Math.round(
        fontSize *
        (block.lineHeight || 1.2)
    );

        const paragraphs =
            block.text.split("\n");

        let y = top;

        for (const paragraph of paragraphs) {

            const words =
    paragraph
        .replace(/\t/g, "    ")
        .split(/\s+/);

            let line = "";

            const lines = [];

            for (let i = 0; i < words.length; i++) {

                const testLine =
                    line.length === 0
                    ? words[i]
                    : line + " " + words[i];

                const width =
                    ctx.measureText(testLine).width;

                if (
                    width > maxWidth &&
                    line !== ""
                ) {

                  lines.push(line);

ctx.fillText(
    line,
    x,
    y
);

y += lineHeight;

                    line = words[i];

                } else {

                    line = testLine;

                }

            }

            if (line.length > 0) {

               lines.push(line);

ctx.fillText(
    line,
    x,
    y
);

y += lineHeight;

            }

        }

        block.renderHeight =
    y - top;

        ctx.restore();

    }

}
}