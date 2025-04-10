// Blog functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load blog posts
    loadBlogPosts();
});

// Function to load blog posts
function loadBlogPosts() {
    const blogPostsContainer = document.getElementById('blog-posts');
    
    // List of actual blog posts that exist
    const posts = [
        {
            id: 'learn-hiragana-fast',
            title: '5 Tips to Learn Hiragana Faster',
            excerpt: 'Discover effective strategies to master Hiragana characters quickly and efficiently with these proven techniques.',
            date: '2024-04-08',
            category: 'Learning Tips',
            image: '../images/blog/hiragana-tips.png'
        },
        {
            id: 'morning-study-routine',
            title: 'Create Your Perfect Morning Japanese Study Routine',
            excerpt: 'Learn how to establish an effective morning routine for learning Japanese that fits your lifestyle and maximizes your learning potential.',
            date: '2024-04-08',
            category: 'Study Habits',
            image: '../images/blog/woman-with-coffee.png'
        },
        {
            id: 'study-anywhere',
            title: 'Study Japanese Anywhere: Tips for Learning While Traveling',
            excerpt: 'Discover how to maintain your Japanese studies while traveling with these effective strategies and tools.',
            date: '2024-04-08',
            category: 'Study Tips',
            image: '../images/blog/man-on-plane.png'
        },
        {
            id: 'hiragana-vs-katakana',
            title: 'Hiragana vs Katakana: Understanding the Differences',
            excerpt: 'Learn the key differences between Hiragana and Katakana writing systems and when to use each one.',
            date: '2024-04-08',
            category: 'Learning Tips',
            image: '../images/blog/katakana-hiragana.png'
        },
        {
            id: 'spaced-repetition',
            title: 'Master Japanese with Spaced Repetition',
            excerpt: 'Discover how spaced repetition can revolutionize your Japanese learning journey and help you retain more information.',
            date: '2024-04-08',
            category: 'Study Tips',
            image: '../images/blog/spaced-repetition.png'
        }
    ];
    
    // Create all blog post cards first before adding to DOM
    const fragment = document.createDocumentFragment();
    posts.forEach(post => {
        const postCard = createBlogPostCard(post);
        fragment.appendChild(postCard);
    });
    
    // Clear loading message and append all cards at once
    requestAnimationFrame(() => {
        blogPostsContainer.innerHTML = '';
        blogPostsContainer.appendChild(fragment);
    });
}

// Function to create a blog post card
function createBlogPostCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-post-card';
    
    // Format date
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create card HTML without image for now
    card.innerHTML = `
        <div class="blog-post-image">
            <img src="${post.image}" alt="${post.title}" onerror="this.src='../images/blog/placeholder.png'">
        </div>
        <div class="blog-post-content">
            <h2 class="blog-post-title">${post.title}</h2>
            <p class="blog-post-excerpt">${post.excerpt}</p>
            <div class="blog-post-meta">
                <div class="blog-post-date">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${formattedDate}
                </div>
                <div class="blog-post-category">${post.category}</div>
            </div>
            <a href="posts/${post.id}.html" class="read-more">Read More</a>
        </div>
    `;
    
    return card;
}

// Function to load a specific blog post
function loadBlogPost(postId) {
    const blogPostContent = document.querySelector('.blog-post-content-full');
    if (!blogPostContent) return;
    
    // Show loading state
    blogPostContent.innerHTML = '<div class="loading">Loading blog post...</div>';
    
    // Load the markdown content
    fetch(`posts/${postId}.md`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Blog post not found');
            }
            return response.text();
        })
        .then(markdown => {
            // Convert markdown to HTML
            const html = convertMarkdownToHtml(markdown);
            
            // Use requestAnimationFrame for smooth rendering
            requestAnimationFrame(() => {
                blogPostContent.innerHTML = html;
            });
        })
        .catch(error => {
            console.error('Error loading blog post:', error);
            blogPostContent.innerHTML = '<p>Sorry, this blog post could not be loaded.</p>';
        });
}

// Simple markdown to HTML converter (basic implementation)
function convertMarkdownToHtml(markdown) {
    let html = markdown
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        
        // Images
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        
        // Lists
        .replace(/^\s*\*\s(.*$)/gm, '<li>$1</li>')
        .replace(/^\s*\d+\.\s(.*$)/gm, '<li>$1</li>')
        
        // Paragraphs
        .replace(/^\s*(\n)?(.+)/gm, function(m) {
            return /\<(\/)?(h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
        })
        
        // Line breaks
        .replace(/\n/g, '<br>');
    
    return html;
} 