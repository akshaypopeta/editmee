/* ==========================================================
   EDITMEE
   FILE : objects/wordBuilder.js
   PURPOSE :
   Build editable word objects from extracted PDF text objects.
==========================================================*/

export default class WordBuilder {

    build(pageObjects) {

        const words = [];

        let id = 1;

        for (const object of pageObjects) {

            if (object.type !== "text") {
                continue;
            }

            const text = object.text.trim();

            if (!text) {
                continue;
            }

            const parts = text.split(/\s+/);

            const averageWidth = object.width / text.length;

            let offset = 0;

            for (const part of parts) {

                const wordWidth = part.length * averageWidth;

                words.push({

                    id: id++,

                    type: "word",

                    page: object.page,

                    parentId: object.id,

                    text: part,

                    transform: [...object.transform],

                    xOffset: offset,

                    width: wordWidth,

                    height: object.height,

                    fontName: object.fontName,

                    selected: false,

                    edited: false,

                    visible: true

                });

                offset += (part.length + 1) * averageWidth;

            }

        }

        return words;

    }

}