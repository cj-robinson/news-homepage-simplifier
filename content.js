// create function to find the first category of an article
function findFirstCategory(item) {
    const first_category = item.getElementsByTagName("category")[0];
    return first_category.textContent;
}

const style = document.createElement('style');
style.textContent = `
.horizontal-container {
    display: flex;
    flex-wrap: wrap; /* Allows wrapping to the next line if there are too many items */
    flex-direction: row;
    gap: 20px; /* Adjust the gap between elements as needed */
}

.horizontal-article {
    display: flex;
    flex-direction: column;
        flex-grow: 1; /* Allow articles to grow and take up available space */

    align-items: center;
    width: 200px; /* Adjust the width as needed */
}

.article-content {
  width: 200px; /* Match image width */
}

.article-title {
  max-width: 200px;
  overflow-wrap: break-word;
  display: block;
}

.horizontal-article img {
    width: 200px; /* Adjust the width as needed */
    height: 200px; /* Adjust the height as needed */
    object-fit: cover; /* This will crop the image to fit the container */
    object-position: center; /* This will center the image within the container */
    border-radius: 25px; 
}

.category-header {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 16px;
    line-height: 18px;
    list-style-type: none;
    color: var(--dark_gray) !important;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.details {
    font-family: 'Barlow', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 13px;
    line-height: 15px;
    color: var(--dark_gray);
    text-transform: uppercase;
}
`;

document.head.appendChild(style);

async function fetchRSS() {
    const rssUrl = "https://iowacapitaldispatch.com/feed/";

    try {
        const preferences = await chrome.storage.sync.get(null);

        const response = await fetch(rssUrl);
        const text = await response.text();

        // get rid of site elements other than the header and footer
        const siteInnerElements = document.querySelectorAll('.site-inner');
        siteInnerElements.forEach(el => el.remove());

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const items = xml.querySelectorAll("item");

        // get the most recent 100 articles
        const recentArticles = Array.from(items).slice(0, 500);

        // get the first article in the Government + Politics category
        const govArticle = recentArticles.find((article) => findFirstCategory(article) == "Government + Politics");

        // get the first article in the Ag/Env category
        const agArticle = recentArticles.find((article) => findFirstCategory(article) == "Ag + Environment");

        // get the first article in the Health Care category
        const healthCareArticle = recentArticles.find((article) => findFirstCategory(article) == "Health Care");

        // get the first article in the Justice category
        const justiceArticle = recentArticles.find((article) => findFirstCategory(article) == "Justice");

        // get the first article in the Education category
        const educationArticle = recentArticles.find((article) => findFirstCategory(article) == "Education");

        const dcArticle = recentArticles.find((article) => findFirstCategory(article) == "DC Dispatch");

        const civilArticle = recentArticles.find((article) => findFirstCategory(article) == "Civil Rights");

        const immArticle = recentArticles.find((article) => findFirstCategory(article) == "Immigration");

        const polArticle = recentArticles.find((article) => findFirstCategory(article) == "Criminal Justice + Policing");

        const econArticle = recentArticles.find((article) => findFirstCategory(article) == "Working + Economy");

        // list all articles
        const firstArticles = [govArticle, agArticle, healthCareArticle, justiceArticle, educationArticle];

        if (preferences.imm) {
            if (immArticle) firstArticles.push(immArticle);
        }

        if (preferences.civil) {
            if (civilArticle) firstArticles.push(civilArticle);
        }

        if (preferences.police) {
            if (polArticle) firstArticles.push(polArticle);
        }

        if (preferences.dc) {
            if (dcArticle) firstArticles.push(dcArticle);
        }


        if (preferences.econ) {
            if (econArticle) firstArticles.push(econArticle);
        }

        const articlesContainer = document.createElement("ul");
        articlesContainer.className = "row homeNewsCard horizontal-container";
        articlesContainer.style.padding = '40px';

        const header = document.createElement("h2");

        // Create icon image
        const icon = document.createElement("img");
        icon.src = chrome.runtime.getURL("icon.png");
        icon.alt = "Icon";
        icon.style.width = "30px"; // Adjust the size as needed
        icon.style.height = "30px"; // Adjust the size as needed
        icon.style.marginRight = "10px"; // Adjust the margin as needed

        // Append icon to header
        header.appendChild(icon);

        // Create text node and append it after the icon
        const textNode = document.createTextNode("TODAY'S HEADLINES");
        header.appendChild(textNode);

        articlesContainer.appendChild(header);

        firstArticles.forEach(item => {
            if (!item) {
                return;
            }
        
            const first_category = findFirstCategory(item)
            const title = item.querySelector("title").textContent;
            const link = item.querySelector("link").textContent;
            const author = item.querySelector("creator").textContent;
            const pubDate = item.querySelector("pubDate").textContent;

            const contentEncoded = item.getElementsByTagName("content:encoded")[0];
            const parser = new DOMParser();
            const contentHTML = parser.parseFromString(contentEncoded.textContent, "text/html");
        
            const imgElement = contentHTML.querySelector("img");
            const imgSrc = imgElement?.getAttribute("src");
        
            const articleDiv = document.createElement("div");
            articleDiv.className = "horizontal-article";
        
            // Category header
            const categoryHeader = document.createElement("h2");
            categoryHeader.textContent = first_category;
            categoryHeader.className = "category-header";
        
            // Create wrapper for image and title
            const contentWrapper = document.createElement("div");
            contentWrapper.className = "article-content";
        
            // Create image anchor tag
            const imgAnchor = document.createElement("a");
            imgAnchor.href = link;
            imgAnchor.target = "_blank";

            // Create image
            const img = document.createElement("img");
            img.src = imgSrc;
            img.className = "attachment-large size-large wp-post-image";
            img.width = 200;
            
            // Append image to its anchor
            imgAnchor.appendChild(img);
        
            // Create title container
            const titleContainer = document.createElement("div");
            titleContainer.className = "article-title";
            
            // Create title anchor tag
            const anchor = document.createElement("a");
            anchor.href = link;
            anchor.target = "_blank";
            anchor.textContent = title;

            // Create text nodes for author and pubDate
            const authorNode = document.createTextNode(`By ${author}`);
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
              }
              
            const pubDateNode = document.createTextNode(`Published: ${formatDate(pubDate)}`);   

            // Create details div
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'details';
            detailsDiv.appendChild(authorNode);
            detailsDiv.appendChild(document.createElement("br"));
            detailsDiv.appendChild(pubDateNode);

            // Append elements
            titleContainer.appendChild(categoryHeader);
            titleContainer.appendChild(anchor);
            titleContainer.appendChild(document.createElement("br"));
            titleContainer.appendChild(detailsDiv);
            contentWrapper.appendChild(imgAnchor);  // Changed from appendChild(img)
            contentWrapper.appendChild(titleContainer);
            articleDiv.appendChild(contentWrapper);
            articlesContainer.appendChild(articleDiv);
        });

        // Insert between header and footer
        const footer = document.querySelector('footer');
        footer.parentNode.insertBefore(articlesContainer, footer);

    } catch (error) {
        console.error("Error:", error);
    }
}

fetchRSS();