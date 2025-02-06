document.addEventListener("DOMContentLoaded", () => {
    const galleryContainer = document.getElementById("gallery");
    const loadingText = document.getElementById("loading");
    const errorText = document.getElementById("error");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageInfo = document.getElementById("pageInfo");

    let images = [];
    let currentPage = 1;
    const imagesPerPage = 8;

    async function fetchImages() {
        try {
            const response = await fetch("https://gmc-l83v.onrender.com/api/images/images");
            const data = await response.json();
            images = data;
            displayImages();
        } catch (error) {
            errorText.textContent = "Error fetching images.";
            loadingText.style.display = "none";
        } finally {
            loadingText.style.display = "none";
        }
    }

    function displayImages() {
        galleryContainer.innerHTML = "";

        // Group images by tags
        const groupedImages = images.reduce((acc, image) => {
            (acc[image.tags] = acc[image.tags] || []).push(image);
            return acc;
        }, {});

        const startIndex = (currentPage - 1) * imagesPerPage;
        const endIndex = startIndex + imagesPerPage;
        const currentImages = images.slice(startIndex, endIndex);

        Object.keys(groupedImages).forEach(tag => {
            const groupDiv = document.createElement("div");
            groupDiv.classList.add("imgdisp-group");

            const groupTitle = document.createElement("h3");
            groupTitle.classList.add("imgdisp-group-title");
            groupTitle.textContent = tag;
            groupDiv.appendChild(groupTitle);

            const gridDiv = document.createElement("div");
            gridDiv.classList.add("imgdisp-grid");

            currentImages
                .filter(image => image.tags === tag)
                .forEach(image => {
                    const imgItem = document.createElement("div");
                    imgItem.classList.add("imgdisp-item");

                    const imgElement = document.createElement("img");
                    imgElement.classList.add("imgdisp-image");
                    imgElement.src = image.url;
                    imgElement.alt = image.description || "Image";

                    const desc = document.createElement("p");
                    desc.classList.add("imgdisp-desc");
                    desc.textContent = image.description || "No description";

                    const tags = document.createElement("p");
                    tags.classList.add("imgdisp-tags");
                    tags.textContent = `Tags: ${image.tags}`;

                    imgItem.appendChild(imgElement);
                    imgItem.appendChild(desc);
                    imgItem.appendChild(tags);
                    gridDiv.appendChild(imgItem);
                });

            groupDiv.appendChild(gridDiv);
            galleryContainer.appendChild(groupDiv);
        });

        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(images.length / imagesPerPage);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayImages();
        }
    });

    nextPageBtn.addEventListener("click", () => {
        if (currentPage < Math.ceil(images.length / imagesPerPage)) {
            currentPage++;
            displayImages();
        }
    });

    fetchImages();
});
