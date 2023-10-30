type Author = {
  name: string;
  link: string;
};

type WpTermTaxonomy = "category" | "post_tag" | "topic" | "group";

type WpTerm<T extends WpTermTaxonomy> = {
  id: number;
  link: string;
  name: string;
  slug: string;
  taxonomy: T;
};

type PostEmbed = {
  author: Author[];
  "wp:featuredmedia": unknown[];
  "wp:term": [
    WpTerm<"category">[],
    WpTerm<"post_tag">[],
    WpTerm<"topic">[],
    WpTerm<"group">[]
  ];
};

type Post = {
  date: string;
  featured_media: string;
  title: {
    rendered: string;
  };
  link: string;
  type: string;
  _embedded: PostEmbed;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const createPostCard = (post: Post) => {
  // Assume there is only one author
  const author = post._embedded.author[0];
  const date = dateFormatter.format(new Date(post.date)).replace(",", "");
  const tags =
    post._embedded["wp:term"][1]?.map((tag) => tag.name)?.join(", ") ?? "";

  return `
  <div class="col-4 card-container">
    <div class="p-card card">
      <div class="p-card__content card-content">
          <div>
            <span class="px-2">${tags}</span>
            <hr class="u-sv2">
            <img class="p-card__image px-2" alt="" height="185" width="330" src="${post.featured_media}">
            <h4 class="px-2">
                <a href="${post.link}">${post.title.rendered}</a>
            </h4>
          </div>
          <div>
            <div class="px-2">
              <address class="inline">By <a rel="author" href="${author.link}">${author.name}</a></address> 
              <i>on <time pubdate datetime="${post.date}" title="${date}">${date}</time></i>
            </div>
            <hr class="u-sv1 p-2">
            <span class="u-no-padding--bottom px-2">${post.type}</span>
          </div>
      </div>
    </div>
  </div>
  `;
};

const app = document.querySelector<HTMLDivElement>("#app")!;

async function getPosts() {
  app.innerHTML = `<h1>Loading...</h1>`;

  try {
    const response = await fetch(
      "https://people.canonical.com/~anthonydillon/wp-json/wp/v2/posts.json"
    );
    const data = (await response.json()) as Post[];

    app.innerHTML = data.map((post) => createPostCard(post)).join("\n");
  } catch (_error) {
    app.innerHTML = `<h1>Something went wrong</h1>`;
  }
}

window.addEventListener("load", () => {
  getPosts();
});
