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

    }


   startEdit(block, bounds, pageState) {

    this.stopEdit();


    const textarea = document.createElement("textarea");


    textarea.value = block.text;


    textarea.style.position = "absolute";

    textarea.style.left = bounds.left + "px";

    textarea.style.top = bounds.top + "px";

    textarea.style.width = bounds.width + "px";

    textarea.style.height = bounds.height + "px";


    textarea.style.fontSize =
        block.height + "px";


    textarea.style.background = "white";

    textarea.style.border =
        "1px solid #2F80ED";

    textarea.style.outline = "none";

    textarea.style.resize = "none";


    pageState.container.appendChild(textarea);


    // Hide original PDF text visually
    block.visible = false;


    textarea.focus();


    this.textarea = textarea;


    textarea.addEventListener(
        "input",
        () => {

            block.text = textarea.value;

            block.edited = true;

        }
    );


}



    stopEdit(block) {

    if (!this.textarea) {
        return;
    }


    if (block) {

        block.text = this.textarea.value;

        block.edited = true;

        block.visible = true;

        block.editing = false;

    }


    this.textarea.remove();

    this.textarea = null;

}

}