document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('phoneContainer');
    const phoneFront = document.getElementById('phoneFront');
    const phoneBack = document.getElementById('phoneBack');
    
    let containerRect = container.getBoundingClientRect();
    
    // Update container position on resize
    window.addEventListener('resize', () => {
        containerRect = container.getBoundingClientRect();
    });
    
    // Handle mouse movement
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Calculate relative mouse position
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2;
        
        const deltaX = (mouseX - centerX) / containerRect.width;
        const deltaY = (mouseY - centerY) / containerRect.height;
        
        // Move front phone (left side) - subtle 3D rotation
        phoneFront.style.transform = `
            translate3d(-20%, 0, 0)
            rotateY(${deltaX * 5}deg)
            rotateX(${-deltaY * 3}deg)
            rotate(-5deg)
        `;
        
        // Move back phone (right side) - subtle 3D rotation
        phoneBack.style.transform = `
            translate3d(20%, 0, -20px)
            rotateY(${deltaX * 5}deg)
            rotateX(${-deltaY * 3}deg)
            rotate(5deg)
        `;
    });
}); 