// Script to generate HTML files from Markdown blog posts
const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Configuration
const POSTS_DIR = path.join(__dirname, 'posts');
const TEMPLATE_PATH = path.join(POSTS_DIR, 'template.html');
const OUTPUT_DIR = path.join(__dirname, 'posts');

// Blog post metadata
const POSTS = [
    {
        id: 'learn-hiragana-fast',
        title: '5 Tips to Learn Hiragana Faster',
        description: 'Discover effective strategies to master Hiragana characters quickly and efficiently with these proven techniques.',
        date: '2023-06-15',
        category: 'Learning Tips',
        keywords: 'hiragana, learning tips, japanese, language learning',
        image: 'https://hiragana.com.au/images/blog/hiragana-tips.jpg'
    },
    {
        id: 'katakana-vs-hiragana',
        title: 'Understanding the Difference Between Katakana and Hiragana',
        description: 'Learn when to use Katakana versus Hiragana and how understanding this distinction can improve your Japanese reading skills.',
        date: '2023-06-10',
        category: 'Grammar',
        keywords: 'katakana, hiragana, japanese writing, grammar',
        image: 'https://hiragana.com.au/images/blog/katakana-hiragana.jpg'
    },
    {
        id: 'spaced-repetition',
        title: 'The Science Behind Spaced Repetition',
        description: 'How Kanabloom uses spaced repetition to help you retain Japanese characters more effectively than traditional study methods.',
        date: '2023-06-05',
        category: 'Learning Science',
        keywords: 'spaced repetition, learning science, memory, retention',
        image: 'https://hiragana.com.au/images/blog/spaced-repetition.jpg'
    }
];

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Generate HTML for a blog post
function generatePostHtml(post) {
    // Read the template
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    
    // Read the markdown content
    const markdownPath = path.join(POSTS_DIR, `${post.id}.md`);
    const markdown = fs.readFileSync(markdownPath, 'utf8');
    
    // Convert markdown to HTML
    const content = marked.parse(markdown);
    
    // Replace placeholders in the template
    let html = template
        .replace(/\[POST_TITLE\]/g, post.title)
        .replace(/\[POST_DESCRIPTION\]/g, post.description)
        .replace(/\[POST_KEYWORDS\]/g, post.keywords)
        .replace(/\[POST_IMAGE\]/g, post.image)
        .replace(/\[POST_ID\]/g, post.id)
        .replace(/\[POST_DATE\]/g, formatDate(post.date))
        .replace(/\[POST_CATEGORY\]/g, post.category);
    
    // Replace the loading placeholder with the actual content
    html = html.replace(
        '<div class="loading">Loading blog post...</div>',
        content
    );
    
    return html;
}

// Generate all blog post HTML files
function generateAllPosts() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Generate HTML for each post
    POSTS.forEach(post => {
        const html = generatePostHtml(post);
        const outputPath = path.join(OUTPUT_DIR, `${post.id}.html`);
        fs.writeFileSync(outputPath, html);
        console.log(`Generated: ${outputPath}`);
    });
    
    console.log('All blog posts generated successfully!');
}

// Run the generator
generateAllPosts(); 