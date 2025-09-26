# Kanabloom Blog System

This directory contains the blog system for Kanabloom. The blog is designed to be simple to maintain while providing good SEO benefits.

## How to Add a New Blog Post

1. Create a new Markdown file in the `posts` directory with the following naming convention:
   ```
   posts/your-post-slug.md
   ```

2. Add the post metadata to the `POSTS` array in `generate-posts.js`:
   ```javascript
   {
       id: 'your-post-slug',
       title: 'Your Post Title',
       description: 'A brief description of your post for SEO',
       date: 'YYYY-MM-DD',
       category: 'Category Name',
       keywords: 'keyword1, keyword2, keyword3',
       image: 'https://hiragana.com.au/images/blog/your-image.jpg'
   }
   ```

3. Add any images for your post to the `images/blog` directory.

4. Run the generator script to create the HTML file:
   ```
   npm run generate-blog
   ```

## Blog Post Format

Blog posts should be written in Markdown format. Here's an example:

```markdown
# Your Post Title

Introduction paragraph...

## Section 1

Content for section 1...

## Section 2

Content for section 2...

- Bullet point 1
- Bullet point 2

## Conclusion

Conclusion paragraph...
```

## SEO Optimization

The blog system is designed with SEO in mind:

- Each post has proper meta tags
- URLs are clean and descriptive
- Content is structured with proper HTML headings
- Images have alt text
- Posts are linked from the main site

## Technical Details

- The blog uses a static site approach with Markdown files
- Posts are converted to HTML using the `marked` library
- The generator script creates optimized HTML files
- No database or server-side processing is required

## Deployment

Simply upload the generated HTML files to your web server. The blog is completely static and will work with any standard web hosting. 