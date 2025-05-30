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
            id: 'japanese-mnemonics-benefits',
            title: 'Unlock Japanese Faster: The Power of Mnemonics',
            excerpt: 'Discover how mnemonics can significantly speed up your Japanese learning. Tips and examples for using memory aids for Hiragana, Katakana, Kanji, and vocabulary.',
            date: '2024-04-13',
            category: 'Learning Techniques',
            image: '../images/blog/japanese-mnemonics-benefits.png'
        },
        {
            id: 'japanese-study-consistency',
            title: 'The Key to Japanese Fluency: Study Consistency',
            excerpt: 'Learn why consistency is crucial for Japanese language acquisition. Tips for building a sustainable study habit and making steady progress towards fluency.',
            date: '2024-04-13',
            category: 'Study Habits',
            image: '../images/blog/japanese-study-consistency.png'
        },
        {
            id: 'japanese-particles-quick-guide',
            title: 'Japanese Particles Made Easy: A Quick Guide',
            excerpt: 'A beginner-friendly guide to essential Japanese particles like は, が, を, に, で, と, も. Understand their functions and use them correctly in sentences.',
            date: '2024-04-13',
            category: 'Grammar',
            image: '../images/blog/japanese-particles-quick-guide.png'
        },
        {
            id: 'japanese-study-schedule',
            title: 'Create Your Perfect Japanese Study Schedule',
            excerpt: 'Learn how to create an effective Japanese study schedule that fits your lifestyle. Discover time management tips, study session planning, and how to balance different aspects of Japanese learning.',
            date: '2024-04-12',
            category: 'Study Tips',
            image: '../images/blog/japanese-study-schedule.png'
        },
        {
            id: 'japanese-pronunciation-guide',
            title: 'Master Japanese Pronunciation: A Complete Guide for Beginners',
            excerpt: 'Learn Japanese pronunciation with our comprehensive guide. Master the sounds of Hiragana, Katakana, and essential Japanese words with expert tips and practice exercises.',
            date: '2024-04-12',
            category: 'Pronunciation',
            image: '../images/blog/japanese-pronunciation-guide.png'
        },
        {
            id: 'japanese-vocabulary-building',
            title: 'Effective Japanese Vocabulary Building: Strategies for Success',
            excerpt: 'Learn proven strategies for building your Japanese vocabulary. Discover effective methods, essential word lists, and tools to expand your Japanese language skills.',
            date: '2024-04-12',
            category: 'Vocabulary',
            image: '../images/blog/japanese-vocabulary-building.png'
        },
        {
            id: 'japanese-study-motivation',
            title: 'Stay Motivated: Japanese Study Tips for Long-Term Success',
            excerpt: 'Discover effective strategies to maintain motivation while learning Japanese. Learn how to overcome plateaus, set achievable goals, and build consistent study habits.',
            date: '2024-04-12',
            category: 'Study Tips',
            image: '../images/blog/japanese-study-motivation.png'
        },
        {
            id: 'japanese-greetings-kana',
            title: 'Essential Japanese Greetings in Hiragana and Katakana',
            excerpt: 'Master common Japanese greetings using Hiragana and Katakana. Perfect for beginners starting their Japanese language journey.',
            date: '2024-04-12',
            category: 'Vocabulary',
            image: '../images/blog/japanese-greetings-kana.png'
        },
        {
            id: 'japanese-listening-skills',
            title: 'Improve Your Japanese Listening Skills',
            excerpt: 'Effective strategies and resources to enhance your Japanese listening comprehension. From beginner to advanced techniques.',
            date: '2024-04-12',
            category: 'Study Tips',
            image: '../images/blog/japanese-listening-skills.png'
        },
        {
            id: 'japanese-writing-practice',
            title: 'Japanese Writing Practice: Tips and Techniques',
            excerpt: 'Comprehensive guide to improving your Japanese writing skills. Practice methods for Hiragana, Katakana, and basic Kanji.',
            date: '2024-04-12',
            category: 'Writing Tips',
            image: '../images/blog/japanese-writing-practice.png'
        },
        {
            id: 'japanese-grammar-tips',
            title: 'Essential Japanese Grammar Tips for Beginners',
            excerpt: 'Master basic Japanese grammar with these essential tips. Learn about particles, verb conjugation, and sentence structure to build a strong foundation.',
            date: '2024-04-12',
            category: 'Grammar',
            image: '../images/blog/japanese-grammar-tips.png'
        },
        {
            id: 'japanese-kanji-basics',
            title: 'Japanese Kanji Basics: A Beginner\'s Guide',
            excerpt: 'Start your Kanji journey with this beginner-friendly guide. Learn about radicals, stroke order, and effective methods for memorizing Kanji characters.',
            date: '2024-04-12',
            category: 'Kanji',
            image: '../images/blog/japanese-kanji-basics.png'
        },
        {
            id: 'spaced-repetition',
            title: 'Master Japanese with Spaced Repetition (SRS)',
            excerpt: 'Learn Japanese faster and retain more using Spaced Repetition Systems (SRS) for Hiragana, Katakana, and vocabulary flashcards.',
            date: '2024-04-12',
            category: 'Study Tips',
            image: '../images/blog/spaced-repetition.png'
        },
        {
            id: 'hiragana-stroke-order',
            title: 'Master Hiragana Stroke Order: Write Japanese Characters Correctly',
            excerpt: 'Learn why proper stroke order matters and get tips for writing Hiragana characters correctly. Essential guide for Japanese learners.',
            date: '2024-04-11',
            category: 'Writing Tips',
            image: '../images/blog/hiragana-stroke-order.png'
        },
        {
            id: 'learn-hiragana-fast',
            title: '5 Tips to Learn Hiragana Faster',
            excerpt: 'Learn Hiragana faster with 5 effective tips. Improve your Japanese writing skills using proven strategies and flashcards.',
            date: '2024-04-08',
            category: 'Learning Tips',
            image: '../images/blog/hiragana-tips.png'
        },
        {
            id: 'morning-study-routine',
            title: 'Create Your Perfect Morning Japanese Study Routine',
            excerpt: 'Design the perfect morning study routine to learn Japanese effectively. Tips for consistency, focus, and using flashcards.',
            date: '2024-04-08',
            category: 'Study Habits',
            image: '../images/blog/woman-with-coffee.png'
        },
        {
            id: 'study-anywhere',
            title: 'Study Japanese Anywhere: Tips for Learning While Traveling',
            excerpt: 'Learn Japanese anywhere! Discover practical tips and tools, like flashcard apps, to continue your studies while traveling.',
            date: '2024-04-08',
            category: 'Study Tips',
            image: '../images/blog/man-on-plane.png'
        },
        {
            id: 'hiragana-vs-katakana',
            title: 'Hiragana vs Katakana: Understanding the Differences',
            excerpt: 'Learn the key differences between Hiragana and Katakana, the two essential Japanese writing systems, and when to use each.',
            date: '2024-04-08',
            category: 'Learning Tips',
            image: '../images/blog/katakana-hiragana.png'
        },
        {
            id: 'hiragana-mistakes',
            title: 'Common Mistakes to Avoid When Learning Hiragana',
            excerpt: 'Learning Hiragana? Avoid common mistakes like mixing similar characters and relying too much on Romaji. Improve your study!',
            date: '2024-04-11',
            category: 'Learning Tips',
            image: '../images/blog/hiragana-mistakes.png'
        },
        {
            id: 'katakana-practice-tips',
            title: 'Katakana Practice: Tips for Mastering Angular Characters',
            excerpt: 'Master Katakana with practice tips! Differentiate similar characters, practice writing angular strokes, and use Katakana flashcards.',
            date: '2024-04-11',
            category: 'Learning Tips',
            image: '../images/blog/katakana-practice-tips.png'
        },
        {
            id: 'creative-japanese-learning',
            title: 'Beyond Flashcards: Creative Ways to Learn Japanese Characters',
            excerpt: 'Go beyond flashcards! Discover creative ways to learn Japanese characters like Hiragana and Katakana, including manga, music, and games.',
            date: '2024-04-11',
            category: 'Study Methods',
            image: '../images/blog/creative-japanese-learning.png'
        },
        {
            id: 'hiragana-learning-time',
            title: 'How Long Does It Really Take to Learn Hiragana?',
            excerpt: 'How long does it take to learn Hiragana? Explore realistic timelines, factors affecting learning speed, and tips for mastering the characters efficiently.',
            date: '2024-04-11',
            category: 'Learning Tips',
            image: '../images/blog/hiragana-learning-time.png'
        },
        {
            id: 'katakana-vs-kanji',
            title: 'Katakana vs Kanji: What\'s the Difference?',
            excerpt: 'Confused about Katakana vs Kanji? Learn the crucial differences between these Japanese writing systems, including their origins, uses, and appearances.',
            date: '2024-04-11',
            category: 'Japanese Writing',
            image: '../images/blog/katakana-vs-kanji.png'
        },
        {
            id: 'effective-japanese-flashcards',
            title: 'Making Japanese Flashcards That Actually Work',
            excerpt: 'Learn how to create effective Japanese flashcards for Hiragana, Katakana, and vocabulary. Tips for design, content, and using SRS for best results.',
            date: '2024-04-11',
            category: 'Study Tools',
            image: '../images/blog/effective-japanese-flashcards.png'
        },
        {
            id: 'japanese-reading-practice',
            title: 'Reading Practice for Japanese Beginners (Hiragana & Katakana)',
            excerpt: 'Start reading Japanese! Find easy reading practice resources and tips for beginners focusing on Hiragana and Katakana characters.',
            date: '2024-04-11',
            category: 'Reading Practice',
            image: '../images/blog/japanese-reading-practice.png'
        },
        {
            id: 'hiragana-before-katakana',
            title: 'Why You Should Learn Hiragana Before Katakana',
            excerpt: 'Why learn Hiragana before Katakana? Understand the standard Japanese learning order and the benefits of mastering Hiragana first.',
            date: '2024-04-11',
            category: 'Learning Order',
            image: '../images/blog/hiragana-before-katakana.png'
        }
    ];
    
    // Sort posts by date, newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

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