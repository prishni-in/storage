const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const PDFFILE = urlParams.get("doc") ?? "./doc.pdf";

let pdfDoc = null,
    currentPage = 1,
    scale = 1.5,
    canvas = document.querySelector(".maindoc canvas"),
    ctx = canvas.getContext("2d");

// Function to render the page
function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        page.render(renderContext);
    });
}

// Function to load the document
function loadDocument(pdfUrl) {
    pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
        pdfDoc = pdf;
        document.getElementById('pagecount').textContent = `of ${pdf.numPages}`;
        renderPage(currentPage);
        loadThumbnails(); // Load thumbnails after document is loaded
    });
}

// Function to zoom in
function zoomIn() {
    scale = Math.min(scale + 0.25, 4);
    renderPage(currentPage);
}

// Function to zoom out
function zoomOut() {
    scale = Math.max(scale - 0.25, 0.5);
    renderPage(currentPage);
}

// Function to go to a specific page
function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > pdfDoc.numPages) return;
    currentPage = pageNum;
    renderPage(currentPage);
}

// Event listeners for toolbar buttons
document.querySelector('.zoom-in').addEventListener('click', zoomIn);
document.querySelector('.zoom-out').addEventListener('click', zoomOut);
document.querySelector('.prev-page').addEventListener('click', () => goToPage(currentPage - 1));
document.querySelector('.next-page').addEventListener('click', () => goToPage(currentPage + 1));
document.getElementById('pageno').addEventListener('change', (e) => {
    goToPage(parseInt(e.target.value));
});

// Function to render a thumbnail
function renderThumbnail(pageNum) {
    pdfDoc.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale: 0.2 });
        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        thumbnailCanvas.height = viewport.height;
        thumbnailCanvas.width = viewport.width;

        page.render({
            canvasContext: thumbnailCtx,
            viewport: viewport
        }).promise.then(() => {
            const thumbnailContainer = document.querySelector('.thumbnails');
            thumbnailContainer.appendChild(thumbnailCanvas);

            thumbnailCanvas.addEventListener('click', () => goToPage(pageNum));
        });
    });
}

// Function to load all thumbnails
function loadThumbnails() {
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        renderThumbnail(i);
    }
}

// Load the PDF document
loadDocument(PDFFILE);

// Disable print functionality
window.print = function () { return; };
document.onkeydown = function (e) {
    if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
    }
};
