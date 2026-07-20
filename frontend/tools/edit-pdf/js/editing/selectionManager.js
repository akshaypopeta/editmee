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
        if (!object) return;
        this.clear();
        object.selected = true;
        this.selectedObject = object;
    }

 enterEditMode(pageNumber, viewport) {
    if (!this.selectedObject) return;

    this.selectedObject.editing = true;

    // Compute bounds in device pixels using the viewport
    const bounds = getObjectBounds(this.selectedObject, viewport);

    this.editingLayer.initializePage(pageNumber);

    // ✅ Pass viewport so the editing layer can compute CSS sizes/positions correctly
    this.editingLayer.createEditingBlock(pageNumber, this.selectedObject, bounds, viewport);
}

 exitEditMode(pageNumber) {
  if (!this.selectedObject) return;

  this.selectedObject.editing = false;

  const blockElement = this.editingLayer.getEditingBlock();
  if (blockElement) {
    this.selectedObject.text = blockElement.textContent;
    this.selectedObject.edited = true;
  }

  // Force redraw immediately
  if (window.renderer && typeof window.renderer.redrawPage === "function") {
    window.renderer.redrawPage(pageNumber);
  }
}


    /**
     * Remove current selection.
     */
    clear() {
        if (this.selectedObject) {
            this.selectedObject.selected = false;
        }
        this.selectedObject = null;
        this.editingLayer.removeEditingBlock();
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
    const blocks = this.objectManager.getBlockObjects(pageNumber);
    let closestBlock = null;
    let smallestDistance = Number.MAX_VALUE;

   for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i];

  // Skip blocks that were hidden and are NOT edited.
  if (block.visible === false && !block.edited) continue;

  const bounds = getObjectBounds(block, viewport);

  if (containsPoint(bounds, x, y)) {
    const centerY = bounds.top + bounds.height / 2;
    const distance = Math.abs(y - centerY);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestBlock = block;
    }
  }
}


    return closestBlock;
}



}
