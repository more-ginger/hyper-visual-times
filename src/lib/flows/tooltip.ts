interface TooltipReturn {
    onDestroy: () => void;
}

export function tooltip(node: HTMLElement, params: string): TooltipReturn {
    const container = document.querySelector("#tooltip-container")

    function handleFocus(event:any): void {
        
        const paragraph = document.createElement("p")
        paragraph.setAttribute("id", "tooltip");
        container?.appendChild(paragraph)
        const textNode = document.createTextNode(params)
        paragraph.appendChild(textNode)

        paragraph.style.position = "absolute";
        paragraph.style.left = `${event.layerX + 5}px`;
        paragraph.style.top = `${event.layerY}px`;

        node.addEventListener("mouseleave", handleBlur);
        node.addEventListener("blur", handleBlur);
        node.removeEventListener("mouseenter", handleFocus);
        node.removeEventListener("focus", handleFocus);
    }

    function handleBlur(): void {
        const tooltipElement = document.querySelector('#tooltip');

        if (tooltipElement) {
            container?.removeChild(tooltipElement);
        }

        node.removeEventListener('mouseleave', handleBlur);
        node.removeEventListener('blur', handleBlur);
        node.addEventListener('mouseenter', handleFocus);
        node.addEventListener('focus', handleFocus);
    }

    node.addEventListener('mouseenter', handleFocus);
    node.addEventListener('focus', handleFocus);

    return {
        onDestroy(): void {
            node.classList.remove('tooltip');
            node.removeEventListener('mouseenter', handleFocus);
            node.removeEventListener('focus', handleFocus);
        }
    };
}