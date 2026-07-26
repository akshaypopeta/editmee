/* ==========================================================
   EDITMEE
   FILE : editing/selectionManager.js
   PURPOSE :
   Handles selection of editable PDF objects.
==========================================================*/

import { getObjectBounds, containsPoint } from "../utils/objectBounds.js";
import EditingLayer from "./editingLayer.js";

export default class SelectionManager {
    constructor(objectManager, pageManager) {
        this.objectManager = objectManager;
        this.pageManager = pageManager;
        this.editingLayer = new EditingLayer(pageManager);
        this.selectedObject = null;
    }

    /**
     * Select an object.
     */
   select(object) {

    if (!object) {
        return;
    }

    this.clear();

    object.selected = true;

    this.selectedObject = object;

    // Mark all child PDF objects selected
    if (object.objects) {

        for (const child of object.objects) {

            child.selected = true;

        }

    }

}

enterEditMode(pageNumber, viewport) {

    if (!this.selectedObject) {

        return;

    }

    this.selectedObject.editing = true;

    const bounds =
        getObjectBounds(
            this.selectedObject,
            viewport
        );

    this.pageManager
        .renderer
        .textEditor
        .startEdit(

            this.selectedObject,

            bounds,

            this.pageManager.getPage(
                pageNumber
            )

        );

}


exitEditMode(pageNumber) {

    if (!this.selectedObject) return;

    this.pageManager.renderer.textEditor.stopEdit(
        this.selectedObject
    );

}


    /**
     * Remove current selection.
     */
clear() {

    if (!this.selectedObject) {

        return;

    }

    this.selectedObject.selected = false;

    if (this.selectedObject.objects) {

        for (const child of this.selectedObject.objects) {

            child.selected = false;

        }

    }

    this.selectedObject = null;

}

    /**
     * Get current selected object.
     */
    getSelectedObject() {
        return this.selectedObject;
    }

    /**
     * Check whether something is selected.
     */
    hasSelection() {
        return this.selectedObject !== null;
    }

    /**
     * Find the text object at the given mouse position.
     */
findObjectAtPoint(pageNumber, x, y, viewport) {

    const blocks =
        this.objectManager.getBlockObjects(pageNumber);

    let selected = null;

    let bestArea = Number.MAX_VALUE;

    for (const block of blocks) {

       if (
    block.visible === false &&
    !block.editing &&
    !block.edited
) {
    continue;
}

        const bounds =
            getObjectBounds(
                block,
                viewport
            );

        if (
            !containsPoint(
                bounds,
                x,
                y
            )
        ) {
            continue;
        }

        const area =
            bounds.width *
            bounds.height;

        // Choose the smallest matching paragraph
        if (area < bestArea) {

            bestArea = area;

            selected = block;

        }

    }

    return selected;

}



}
