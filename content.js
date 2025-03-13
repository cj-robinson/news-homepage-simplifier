// create function to find the first category of an article
function findFirstCategory(item) {
    const first_category = item.getElementsByTagName("category")[0];
    return first_category.textContent;
}

// create function to get all categories of an article
function getAllCategories(item) {
    const categories = item.getElementsByTagName("category");
    return Array.from(categories).map(cat => cat.textContent);
}

const style = document.createElement('style');
style.textContent = `
.horizontal-container {
    display: flex;
    flex-wrap: wrap; /* Allows wrapping to the next line if there are too many items */
    flex-direction: row;
    justify-content: space-evenly;; 
    gap: 20px; /* Adjust the gap between elements as needed */
    margin-left: 1em;
    margin-right: 1em;

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
    border-radius: 15px; 
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

        // track articles that have already been pulled
        let usedArticles = new Set();

        // find first unused article for a given category
        function findArticleForCategory(articles, category) {
            const article = articles.find(article => {
                const categories = getAllCategories(article);
                if (categories.includes(category) && !usedArticles.has(article)) {
                    usedArticles.add(article);
                    return true;
                }
                return false;
            });
            return article ? { article, matchedCategory: category } : null;
        }
        

        const govArticle = findArticleForCategory(recentArticles, "Government + Politics");
        const agArticle = findArticleForCategory(recentArticles, "Ag + Environment");
        const healthCareArticle = findArticleForCategory(recentArticles, "Health Care");
        const justiceArticle = findArticleForCategory(recentArticles, "Justice");
        const educationArticle = findArticleForCategory(recentArticles, "Education");
        
        const firstArticles = [govArticle, agArticle, healthCareArticle, justiceArticle, educationArticle];
        
        if (preferences.imm) {
            const immArticle = findArticleForCategory(recentArticles, "Immigration");
            if (immArticle) firstArticles.push(immArticle);
        }

        if (preferences.civil) {
            const civilArticle = findArticleForCategory(recentArticles, "Civil Rights");
            if (civilArticle) firstArticles.push(civilArticle);
        }

        if (preferences.police) {
            const polArticle = findArticleForCategory(recentArticles, "Criminal Justice + Policing");
            if (polArticle) firstArticles.push(polArticle);
        }

        if (preferences.dc) {
            const dcArticle = findArticleForCategory(recentArticles, "DC Dispatch");
            if (dcArticle) firstArticles.push(dcArticle);
        }


        if (preferences.econArticle) {
            const econArticle = findArticleForCategory(recentArticles, "Working + Economy");
            if (econArticle) firstArticles.push(econArticle);
        }

        const articlesContainer = document.createElement("ul");
        articlesContainer.className = "row homeNewsCard horizontal-container";
        articlesContainer.style.padding = '40px';

        const header = document.createElement("h2");

        // create icon image
        const icon = document.createElement("img");
        icon.src = chrome.runtime.getURL("icon.png");
        icon.alt = "Icon";
        icon.style.width = "30px"; // Adjust the size as needed
        icon.style.height = "30px"; // Adjust the size as needed
        icon.style.marginRight = "10px"; // Adjust the margin as needed
        icon.style.marginBottom = "5px"; // Adjust the margin as needed

        // append icon to header
        header.appendChild(icon);

        // Create text node and append it after the icon
        const textNode = document.createTextNode("TODAY'S HEADLINES");
        header.appendChild(textNode);

        articlesContainer.appendChild(header);

        firstArticles.forEach(item => {
            if (!item) {
                return;
            }
        
            const { article, matchedCategory } = item;
            const title = article.querySelector("title").textContent;
            const link = article.querySelector("link").textContent;
            const author = article.querySelector("creator").textContent;
            const pubDate = article.querySelector("pubDate").textContent;
        
            const contentEncoded = item.article.getElementsByTagName("content:encoded")[0];
            console.log(contentEncoded);
            const parser = new DOMParser();
            const contentHTML = parser.parseFromString(contentEncoded.textContent, "text/html");
        
            const imgElement = contentHTML.querySelector("img");
            const imgSrc = imgElement?.getAttribute("src");
        
            const articleDiv = document.createElement("div");
            articleDiv.className = "horizontal-article";
            
            const categoryHeader = document.createElement("h2");
            categoryHeader.className = "category-header";
            categoryHeader.textContent = matchedCategory;

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