// The action is used to assign a dynamic position to in-text footnotes
// The approach is currently a bit basic, I just get the position of a reference in text and assign
// the top position to a footnote that has position absolute. This way, the footnote is moved to the right of its reference.

export function setFootnotes(node:HTMLDivElement) {
    // get section where footnotes are included
    const footNoteSection = node.querySelector(".footnotes");
    // get rect of parent to calculate the footnotes relative position
    const parentRect = node.getBoundingClientRect();
    
    if (footNoteSection) {
        // get individual footnotes as nodes
        const footnotesNodes = footNoteSection.querySelectorAll("li")
        // iterate over footnotes
        if (footnotesNodes) {
            for (let i = 0; i < footnotesNodes.length; i++) {
                // get the current footnote
                const currentNode = footnotesNodes[i]
                // get previous one
                const previousNode = footnotesNodes[i - 1]
                // get linked ref in text
                const inTextRef = node.querySelector(`#footnote-ref-${i + 1}`)
                // if the ref is not null, get the rect
                const boundingRectOfRef = inTextRef?.getBoundingClientRect()
                
                // here we calc the relative position of ref to the container, 
                // so that the footnotes will be at fixed pos
                const relativeRect = {
                    top: Math.max((boundingRectOfRef?.top ?? 0) - parentRect.top, 180),
                    left: (boundingRectOfRef?.left ?? 0) - parentRect.left,
                    bottom: (boundingRectOfRef?.bottom ?? 0) - parentRect.bottom,
                    right: (boundingRectOfRef?.right ?? 0) - parentRect.right
                }

                // get the reference position on page
                const YOfRef = relativeRect?.top ?? 0

                // get the rect of the previous footnote
                const boundingRectOfPrevNode = previousNode 
                    ? previousNode.getBoundingClientRect() 
                    : null
                
                // get the y pos of the previous footnote
                const yOfPreviousNode = boundingRectOfPrevNode 
                    ? boundingRectOfPrevNode.y 
                    : 0
                // get the height of the previous footnote
                const hOfPreviousNode = boundingRectOfPrevNode 
                    ? boundingRectOfPrevNode.height 
                    : 0
                // assigns top property to current footnote, 
                // to avoid overlap we calc if we should add a buffer to the footnote
                currentNode.style.top = YOfRef 
                    + (yOfPreviousNode + hOfPreviousNode > YOfRef ? hOfPreviousNode : 0) 
                    + "px"
            }
        }

    }
   
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}