import { useEffect } from 'react';

// Custom hook to set the document title dynamically per page
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const previousTitle = document.title;
    document.title = title.includes('KisanMandi') ? title : `${title} | KisanMandi`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
