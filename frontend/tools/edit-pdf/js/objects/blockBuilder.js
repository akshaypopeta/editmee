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

        for (const object of pageObjects) {

            if (object.type !== "text") {
                continue;
            }

            const text = object.text.trim();

            if (!text) {
                continue;
            }

            blocks.push({

                id: id++,

                type: "block",

                page: object.page,

                x: object.transform[4],

                y: object.transform[5],

                width: object.width,

                height: object.height,

                text: text,

                objects: [object],

                selected: false,

                editing: false,

                edited: false,

                visible: true

            });

        }

        return blocks;

    }

}