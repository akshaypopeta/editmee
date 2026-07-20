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

        if (!pageState) {
            return;
        }

        const ctx = pageState.selectionContext;

        const viewport = pageState.viewport;

        const objects =
            this.objectManager.getBlockObjects(pageNumber);

        for (const object of objects) {

            if (!object.edited) {
                continue;
            }

            const x = object.x * viewport.scale;

            const y =
                viewport.height -
                (object.y * viewport.scale);

            ctx.save();

            ctx.font =
                `${object.height * viewport.scale}px sans-serif`;

            ctx.fillStyle = "#000";

            ctx.textBaseline = "alphabetic";

            ctx.fillText(
                object.text,
                x,
                y
            );

            ctx.restore();

        }

    }

}