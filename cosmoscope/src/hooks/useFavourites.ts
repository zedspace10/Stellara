import { useState } from "react";

export function useFavourites() {
  const [favourites, setFavourites] = useState<string[]>(() => {
    try { 
      return JSON.parse(localStorage.getItem('stellara_favourites') || '[]'); 
    } catch { 
      return []; 
    }
  });
  
  const toggle = (id: string) => {
    setFavourites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('stellara_favourites', JSON.stringify(next));
      return next;
    });
  };
  
  const isFavourite = (id: string) => favourites.includes(id);
  
  return { favourites, toggle, isFavourite };
}