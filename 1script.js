const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const PDFFILE = urlParams.get("doc") ?? "./doc.pdf";

// Initialize pdfViewer
let pdfViewer = new PDFjsViewer($(".maindoc"), {
    // zoomValues: [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4],
    onDocumentReady: function () {
        this.setZoom("1.5");
        $(".zoomval").text("150%");
    },
    onZoomChange: function (zoom) {
        zoom = parseInt(zoom * 10000) / 100;
        $(".zoomval").text(zoom + "%");
    },
    onActivePageChanged: function (page) {
        let pageno = $(page).data("page");
        let pagetotal = this.getPageCount();

        if (!$(page).hasClass("hidden")) {
            pdfThumbnails.setActivePage(pageno);
            $("#pageno").val(pageno);
            $("#pageno").attr("max", pagetotal);
            $("#pagecount").text("of " + pagetotal);
        }
    },
    renderingscale: 2
});


pdfViewer.loadDocument(PDFFILE);

// Function to set horizontal scroll
function setHorizontal() {
    document.querySelector(".maindoc").classList.add("horizontal-scroll");
    pdfViewer.refreshAll();
}

// Function to set vertical scroll
function setVertical() {
    document.querySelector(".maindoc").classList.remove("horizontal-scroll");
    pdfViewer.refreshAll();
}

// Function to toggle thumbnail visibility
function togglethumbs(el) {
    if (el.classList.contains("pushed")) {
        el.classList.remove("pushed");
        document.querySelector(".thumbnails").classList.add("hide");
    } else {
        el.classList.add("pushed");
        document.querySelector(".thumbnails").classList.remove("hide");
    }
}

// Initialize pdfThumbnails
let pdfThumbnails = new PDFjsViewer($(".thumbnails"), {
    zoomFillArea: 0.7,
    onNewPage: function (page, i) {
        $('<div class="numbering">').text(i).appendTo(page);
        page.on("click", function () {
            pdfThumbnails.setActivePage(page.data("page"));
            if (!pdfViewer.isPageVisible(page.data("page"))) {
                pdfViewer.scrollToPage(page.data("page"));
            }
        });
    },
    onDocumentReady: function () {
        this.setZoom("fit");
    }
});

// Function to set active page in thumbnails
pdfThumbnails.setActivePage = function (pageno) {
    this.$container.find(".pdfpage").removeClass("selected");
    this.$container.find('.pdfpage[data-page="' + pageno + '"]').addClass("selected");

    if (!this.isPageVisible(pageno)) {
        this.scrollToPage(pageno);
    }
}.bind(pdfThumbnails);

pdfThumbnails.loadDocument(PDFFILE);

// Disable print functionality
window.print = function () {
    return;
};

document.onkeydown = function (e) {
    if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
    }
}


function searchInDocument(query) {
    if (!query) return;

    if (!pdfViewer.pdf || !pdfViewer.pdf.numPages) {
        console.error("PDF document is not fully loaded yet.");
        return;
    }

    let currentPageNumber = pdfViewer._activePage;

    if (currentPageNumber < 1 || currentPageNumber > pdfViewer.pdf.numPages) {
        console.error("Invalid page request.");
        return;
    }

   pdfViewer.pages[currentPageNumber].getTextContent().then(textContent => {
        let text = textContent.items.map(item => item.str).join(" ");
        let regex = new RegExp(query, "gi");
        let matches = [...text.matchAll(regex)];

        if (matches.length > 0) {
            // Highlight matches
            highlightMatches(matches);
        } else {
            alert("No matches found.");
        }
    }).catch(error => {
        console.error("Error during search:", error);
    });
}


function highlightMatches(matches) {
    // Clear previous highlights
    $(".highlight").remove();

    let currentPage = pdfViewer.pdf.getPage(pdfViewer.currentPage);

    currentPage.then(page => {
        return page.getTextContent();
    }).then(textContent => {
        textContent.items.forEach((item, index) => {
            matches.forEach(match => {
                if (item.str.includes(match[0])) {
                    let highlight = document.createElement("div");
                    highlight.className = "highlight";
                    highlight.style.left = item.transform[4] + "px";
                    highlight.style.top = item.transform[5] + "px";
                    highlight.style.width = item.width + "px";
                    highlight.style.height = item.height + "px";
                    $(".maindoc").append(highlight);
                }
            });
        });
    });
}

// Add some basic styles for highlights
const style = document.createElement('style');
style.innerHTML = `
    .highlight {
        position: absolute;
        background-color: yellow;
        opacity: 0.5;
    }
`;
document.head.appendChild(style);
