/* ==========================================================
   EDITMEE
   FILE : rendering/viewportManager.js
   PURPOSE :
   Tracks which PDF pages are currently visible inside
   the viewer.

   Does NOT render pages.
   Does NOT load pages.
   Does NOT manage zoom.

   It only updates page visibility state.
==========================================================*/

export default class ViewportManager {

    constructor(pageManager, scrollContainer) {

        this.pageManager = pageManager;

        this.scrollContainer = scrollContainer;

        // Number of pages to preload above and below
        // the visible viewport.
        // Used later by RenderQueue.
        this.buffer = 1;

    }

    /* ==========================================================
       UPDATE VISIBLE PAGES
    ========================================================== */

    updateVisiblePages() {

        const viewportTop = this.scrollContainer.scrollTop;
        const viewportBottom =
            viewportTop + this.scrollContainer.clientHeight;

        const pages = this.pageManager.getPages();

        pages.forEach(page => {

            if (!page.container) {
                return;
            }

            const pageTop = page.container.offsetTop;
            const pageBottom =
                pageTop + page.container.offsetHeight;

            const visible =
                pageBottom >= viewportTop &&
                pageTop <= viewportBottom;

            page.isVisible = visible;

            if (visible) {

                page.lastVisible = performance.now();

            }

        });

    }

    /* ==========================================================
       GET VISIBLE PAGES
    ========================================================== */

    getVisiblePages() {

        const visiblePages = [];

        this.pageManager.getPages().forEach(page => {

            if (page.isVisible) {

                visiblePages.push(page);

            }

        });

        return visiblePages;

    }

}