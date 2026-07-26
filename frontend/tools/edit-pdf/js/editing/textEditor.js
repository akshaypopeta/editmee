/* ==========================================================
   EDITMEE
   FILE : editing/textEditor.js
   PURPOSE :
   Handles inline text editing for selected PDF blocks.
==========================================================*/

export default class TextEditor {

 constructor(renderer) {

    this.renderer = renderer;

    this.textarea = null;

    this.popup = null;

    this.editBox = null;

    this.currentBlock = null;

    this.createPopup();

}

createPopup() {

    this.popup = document.createElement("div");

    this.popup.style.position = "fixed";
    this.popup.style.display = "none";
    this.popup.style.width = "350px";
    this.popup.style.background = "#fff";
    this.popup.style.border = "1px solid #dcdcdc";
    this.popup.style.borderRadius = "8px";
    this.popup.style.padding = "12px";
    this.popup.style.boxShadow = "0 10px 30px rgba(0,0,0,.2)";
    this.popup.style.zIndex = "99999";

    const title = document.createElement("div");

    title.innerText = "Edit Text";

    title.style.fontWeight = "600";

    title.style.marginBottom = "10px";

    this.editBox = document.createElement("textarea");

    this.editBox.style.width = "100%";

    this.editBox.style.height = "120px";

    this.editBox.style.resize = "vertical";

    this.editBox.style.boxSizing = "border-box";

    const footer = document.createElement("div");

    footer.style.display = "flex";

    footer.style.justifyContent = "flex-end";

    footer.style.gap = "10px";

    footer.style.marginTop = "10px";

    const cancelBtn = document.createElement("button");

    cancelBtn.innerText = "Cancel";

    const applyBtn = document.createElement("button");

    applyBtn.innerText = "Apply";

    footer.appendChild(cancelBtn);

    footer.appendChild(applyBtn);

    this.popup.appendChild(title);

    this.popup.appendChild(this.editBox);

    this.popup.appendChild(footer);

    document.body.appendChild(this.popup);

    cancelBtn.onclick = () => {

        this.stopEdit();

    };

    applyBtn.onclick = () => {

        if (!this.currentBlock) return;

        this.currentBlock.text = this.editBox.value;

this.currentBlock.visible = true;

this.currentBlock.edited = true;

        this.currentBlock.edited = true;

        this.currentBlock.visible = true;

        this.stopEdit(this.currentBlock);

        this.renderer.renderPage(
    this.currentBlock.page
);

    };

}

startEdit(block, bounds, pageState) {

    this.stopEdit();

    const textarea = document.createElement("textarea");

    textarea.value = block.text;

    textarea.style.position = "absolute";

    textarea.style.left = bounds.left + "px";

    const baseline =
    pageState.viewport.height -
    (block.y * pageState.viewport.scale);

const top =
    baseline -
    (block.fontSize || block.height);

textarea.style.top = top + "px";

    // --------------------------------------------------
    // Fixed paragraph width (Never change)
    // --------------------------------------------------

    textarea.style.width = bounds.width + "px";
    textarea.style.minWidth = bounds.width + "px";
    textarea.style.maxWidth = bounds.width + "px";

    // --------------------------------------------------
    // Auto growing height
    // --------------------------------------------------

    textarea.style.minHeight = bounds.height + "px";

    textarea.style.height = "auto";

    textarea.style.overflow = "hidden";

    textarea.style.resize = "none";

    // --------------------------------------------------
    // Original formatting
    // --------------------------------------------------

    const fontSize =
        block.fontSize || block.height;

    textarea.style.fontSize =
        fontSize + "px";

    textarea.style.fontFamily =
        block.fontFamily || "Arial";

    textarea.style.fontWeight =
        block.fontWeight || "normal";

    textarea.style.fontStyle =
        block.fontStyle || "normal";

    textarea.style.lineHeight =
        block.lineHeight || 1.2;

    textarea.style.color =
        block.color || "#000";

    textarea.style.background = "#ffffff";

    textarea.style.border =
        "1px solid #2F80ED";

    textarea.style.outline = "none";

    textarea.style.padding = "2px";

    textarea.style.margin = "0";

    textarea.style.boxSizing =
        "border-box";

        textarea.style.fontKerning = "normal";

textarea.style.letterSpacing = "0";

textarea.style.textRendering = "geometricPrecision";

    textarea.style.whiteSpace =
        "pre-wrap";

    textarea.style.wordBreak =
        "break-word";

    textarea.style.overflowWrap =
        "break-word";

    textarea.style.zIndex = "9999";

    textarea.wrap = "soft";

    pageState.container.appendChild(textarea);

    block.visible = false;

    this.renderer.redrawPage(block.page);

    textarea.focus();

    textarea.setSelectionRange(
    textarea.value.length,
    textarea.value.length
);

    this.textarea = textarea;

    this.currentBlock = block;

   const autoGrow = () => {

    textarea.style.height = "0px";

    textarea.style.height =
        Math.max(
            bounds.height,
            textarea.scrollHeight
        ) + "px";

};

   autoGrow();

textarea.addEventListener(
    "input",
    () => {

        block.text =
            textarea.value.replace(/\r\n/g, "\n");

        block.edited = true;

        autoGrow();

        block.renderHeight =
            textarea.scrollHeight;

        this.renderer.drawEditedObjects(
            block.page
        );

        this.renderer.drawSelection(
            block.page
        );

    }
);

}



stopEdit(block) {

    if (!this.textarea) {

        return;

    }

    if (block) {

      block.text =
    this.textarea.value;

block.edited = true;

block.visible = false;

block.editing = false;

// Save final paragraph height
block.renderHeight =
    this.textarea.scrollHeight;

// Redraw page immediately
this.renderer.drawEditedObjects(
    block.page
);

this.renderer.drawSelection(
    block.page
);

    }

    this.textarea.remove();

    this.textarea = null;

    this.currentBlock = null;

}

}