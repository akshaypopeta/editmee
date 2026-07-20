/* ==========================================================
   EDITMEE
   FILE : objects/objectManager.js
   PURPOSE :
   Stores and manages all editable objects extracted
   from every PDF page.

   Object Types:
   - text
   - image
   - shape (future)
   - annotation (future)
==========================================================*/

export default class ObjectManager {

    constructor() {

       // Original extracted PDF objects
this.pages = new Map();

this.blockObjects = new Map();

// Editable word objects
this.wordObjects = new Map();

    }

    /**
     * Create page entry if missing.
     */
    createPage(pageNumber) {

        if (!this.pages.has(pageNumber)) {

            this.pages.set(pageNumber, []);

        }

    }

    /**
     * Add object to page.
     */
    addObject(pageNumber, object) {

        this.createPage(pageNumber);

        this.pages
            .get(pageNumber)
            .push(object);

    }

    /**
     * Replace all page objects.
     */
    setPageObjects(pageNumber, objects) {

        this.pages.set(pageNumber, objects);

    }

    /**
     * Get page objects.
     */
    getPageObjects(pageNumber) {

        return this.pages.get(pageNumber) || [];

    }

    /**
     * Get all pages.
     */
    getAllPages() {

        return this.pages;

    }

/**
 * Replace all word objects for a page.
 */
setWordObjects(pageNumber, words) {

    this.wordObjects.set(pageNumber, words);

}

/**
 * Get all word objects for a page.
 */
getWordObjects(pageNumber) {

    return this.wordObjects.get(pageNumber) || [];

}

/**
 * Add a single word object.
 */
addWordObject(pageNumber, word) {

    if (!this.wordObjects.has(pageNumber)) {

        this.wordObjects.set(pageNumber, []);

    }

    this.wordObjects.get(pageNumber).push(word);

}

setBlockObjects(pageNumber, blocks) {

    this.blockObjects.set(pageNumber, blocks);

}

getBlockObjects(pageNumber) {

    return this.blockObjects.get(pageNumber) || [];

}
    
    /**
     * Remove everything.
     */
clear() {

    this.pages.clear();

    this.blockObjects.clear();

    this.wordObjects.clear();

}

}