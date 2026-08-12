import { useEffect } from 'react';

export const useScrollToItem = (paramName = 'videoId', prefix = 'video-card-', dependencyArray = []) => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get(paramName);
    
    if (id) {
      // Small delay to allow list rendering
      const timer = setTimeout(() => {
        const element = document.getElementById(`${prefix}${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Highlight effect
          const originalTransition = element.style.transition;
          const originalBoxShadow = element.style.boxShadow;
          
          element.style.transition = 'box-shadow 0.5s ease-in-out';
          element.style.boxShadow = '0 0 20px rgba(251, 146, 60, 0.6)'; // Brand orange glow
          
          setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
            setTimeout(() => {
               element.style.transition = originalTransition;
            }, 500);
          }, 2500);
        }
      }, 1000); // 1s delay to make sure everything including queries are loaded
      
      return () => clearTimeout(timer);
    }
  }, [window.location.search, ...dependencyArray]);
};
