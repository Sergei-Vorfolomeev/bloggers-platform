import {DBType} from "./db.types";

export const db: DBType = {
    blogs: [
        {
            id: "1",
            name: "Blog Name",
            description: "Blog Description",
            websiteUrl: "https://web-site.com"
        }
    ],
    posts: [
        {
            id: "1",
            title: "Post Title",
            shortDescription: "Post Short Description",
            content: "Post Content",
            blogId: "1",
            blogName: "Blog Name"
        }
    ]
}

