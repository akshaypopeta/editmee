/* ==========================================================
   EDITMEE
   FILE : rendering/renderQueue.js
   PURPOSE :
   Production-ready render scheduler.
==========================================================*/

export default class RenderQueue {

    constructor(pdfRenderer) {

        this.pdfRenderer = pdfRenderer;

        // Queue of pages waiting to render
        this.queue = [];

        // Prevent duplicate entries
        this.queueSet = new Set();

        // Currently rendering?
        this.processing = false;

    }

    /* ==========================================================
       ADD PAGE
    ========================================================== */

    enqueue(pageNumber, priority = 0) {

        // Already queued?
        if (this.queueSet.has(pageNumber)) {
            return;
        }

        this.queue.push({
            pageNumber,
            priority
        });

        this.queueSet.add(pageNumber);

        // Higher priority first
        this.queue.sort((a, b) => b.priority - a.priority);

        this.process();

    }

    /* ==========================================================
       PROCESS QUEUE
    ========================================================== */

    async process() {

        if (this.processing) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {

            const item = this.queue.shift();

            this.queueSet.delete(item.pageNumber);

            try {

                await this.pdfRenderer.renderPage(item.pageNumber);

            } catch (error) {

                console.error(
                    `Failed to render page ${item.pageNumber}`,
                    error
                );

            }

        }

        this.processing = false;

    }

    /* ==========================================================
       CLEAR
    ========================================================== */

    clear() {

        this.queue.length = 0;

        this.queueSet.clear();

    }

    /* ==========================================================
       CANCEL PAGE
    ========================================================== */

    cancel(pageNumber) {

        this.queue = this.queue.filter(item => {

            return item.pageNumber !== pageNumber;

        });

        this.queueSet.delete(pageNumber);

        this.pdfRenderer.cancel(pageNumber);

    }

    /* ==========================================================
       HELPERS
    ========================================================== */

    isQueued(pageNumber) {

        return this.queueSet.has(pageNumber);

    }

    isProcessing() {

        return this.processing;

    }

}