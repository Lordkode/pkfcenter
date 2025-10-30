/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { items as itemsSDK } from "@wix/data";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { useEffect, useRef, useState } from "react";

// Type pour une section
interface Section {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  backgroundImage: string;
  backgroundOverlay?: string;
}

// Type pour une page
interface PageData {
  id: string;
  name: string;
  sections: Section[];
}

// Type pour les items Wix (correspondant exactement à votre structure)
interface WixItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  buttonText: string;
  pageName: string;
}

// Page Component
function ScrollPage({
  sections,
  indicatorPosition = "right"
}: {
  sections: Section[];
  indicatorPosition?: "right" | "left";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const isScrolling = useRef(false);

  const extendedSections = [...sections, ...sections, ...sections];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    const sectionHeight = window.innerHeight;

    const handleScroll = () => {
      if (isScrolling.current) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const index = Math.round(scrollTop / sectionHeight);

        setCurrentIndex(index);

        if (index === 0) {
          isScrolling.current = true;
          container.style.scrollBehavior = "auto";
          container.scrollTop = sections.length * sectionHeight;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
            isScrolling.current = false;
          }, 50);
        } else if (index === extendedSections.length - 1) {
          isScrolling.current = true;
          container.style.scrollBehavior = "auto";
          container.scrollTop = (sections.length * 2 - 1) * sectionHeight;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
            isScrolling.current = false;
          }, 50);
        }
      }, 150);
    };

    container.scrollTop = sections.length * sectionHeight;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [sections.length, extendedSections.length]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {extendedSections.map((section, index) => (
          <section
            key={index}
            className="relative h-screen w-full flex items-center snap-start snap-always"
            style={{
              backgroundImage: `url(${section.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            onError={(e) => {
              console.error('Erreur de chargement image pour:', section.title, section.backgroundImage);
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Contenu */}
            <div className="relative z-10 max-w-2xl ml-12 md:ml-20 lg:ml-32 text-white space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {section.title}
              </h2>

              <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
                {section.description}
              </p>

              <button
                onClick={() => section.buttonLink && window.open(section.buttonLink, '_blank')}
                className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {section.buttonText}
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* Indicateur de position */}
      <div
        className={`fixed ${indicatorPosition === "right" ? "right-8" : "left-8"} top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20`}
      >
        {sections.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${(currentIndex % sections.length) === i
              ? "bg-white h-8"
              : "bg-white/40"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const isHorizontalScrolling = useRef(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le client Wix
  const wixClient = createClient({
    modules: {
      itemsSDK,
    },
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!
    })
  });

  // Fonction pour convertir l'URL Wix en URL utilisable
  const convertWixImageUrl = (wixUrl: string): string => {
    console.log('URL originale:', wixUrl);

    // Format: wix:image://v1/4336f3_xxx~mv2.jpg/filename.jpg#params
    if (wixUrl.startsWith('wix:image://')) {
      // Extraire la partie entre v1/ et le # (ou /)
      const match = wixUrl.match(/v1\/(.*?)(?:\/|#)/);
      if (match) {
        const mediaId = match[1];
        const convertedUrl = `https://static.wixstatic.com/media/${mediaId}`;
        console.log('URL convertie:', convertedUrl);
        return convertedUrl;
      }
    }

    // Si ce n'est pas une URL wix:image://, retourner telle quelle
    console.log('URL non modifiée:', wixUrl);
    return wixUrl;
  };

  // Récupérer les données depuis Wix CMS
  useEffect(() => {
    const fetchWixData = async () => {
      try {
        setLoading(true);

        // Remplacez par le nom exact de votre collection
        const response = await wixClient.itemsSDK.query("HomePage").find();

        console.log('Réponse complète:', response);

        if (!response.items || response.items.length === 0) {
          setError("Aucune donnée trouvée dans la collection");
          setLoading(false);
          return;
        }

        // Grouper les items par pageName
        const groupedByPage: { [key: string]: WixItem[] } = {};

        response.items.forEach((item: any) => {
          // Les données sont directement au niveau de l'item, pas dans item.data
          const wixItem: WixItem = {
            _id: item._id || '',
            title: item.title || '',
            description: item.description || '',
            image: item.image || '',
            url: item.url || '',
            buttonText: item.buttonText || 'Découvrir',
            pageName: item.pageName || 'Default',
          };

          if (!groupedByPage[wixItem.pageName]) {
            groupedByPage[wixItem.pageName] = [];
          }
          groupedByPage[wixItem.pageName].push(wixItem);
        });

        // Convertir en format PageData
        const pagesData: PageData[] = Object.entries(groupedByPage).map(([pageName, items]) => ({
          id: pageName.toLowerCase().replace(/\s+/g, '-'),
          name: pageName,
          sections: items.map((item) => ({
            title: item.title,
            description: item.description,
            buttonText: item.buttonText,
            buttonLink: item.url,
            backgroundImage: convertWixImageUrl(item.image),
            backgroundOverlay: "rgba(0, 0, 0, 0.4)",
          })),
        }));

        console.log('Pages formatées:', pagesData);
        setPages(pagesData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des données Wix:", err);
        setError(`Erreur lors du chargement des données: ${err}`);
        setLoading(false);
      }
    };

    fetchWixData();
  }, []);

  const extendedPages = pages.length > 0 ? [...pages, ...pages, ...pages] : [];

  useEffect(() => {
    if (pages.length === 0) return;

    const container = horizontalScrollRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    const pageWidth = window.innerWidth;

    const handleHorizontalScroll = () => {
      if (isHorizontalScrolling.current) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const index = Math.round(scrollLeft / pageWidth);

        const targetScroll = index * pageWidth;
        if (Math.abs(scrollLeft - targetScroll) > 1) {
          container.scrollLeft = targetScroll;
        }

        setCurrentPageIndex(index);

        if (index === 0) {
          isHorizontalScrolling.current = true;
          container.style.scrollBehavior = "auto";
          container.scrollLeft = pages.length * pageWidth;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
            isHorizontalScrolling.current = false;
          }, 50);
        } else if (index === extendedPages.length - 1) {
          isHorizontalScrolling.current = true;
          container.style.scrollBehavior = "auto";
          container.scrollLeft = (pages.length * 2 - 1) * pageWidth;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
            isHorizontalScrolling.current = false;
          }, 50);
        }
      }, 100);
    };

    container.scrollLeft = pages.length * pageWidth;

    container.addEventListener("scroll", handleHorizontalScroll);
    return () => {
      container.removeEventListener("scroll", handleHorizontalScroll);
      clearTimeout(scrollTimeout);
    };
  }, [pages.length, extendedPages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = horizontalScrollRef.current;
      if (!container || isHorizontalScrolling.current) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        container.scrollBy({
          left: window.innerWidth,
          behavior: "smooth"
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        container.scrollBy({
          left: -window.innerWidth,
          behavior: "smooth"
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Affichage du chargement
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl animate-pulse">Chargement des données...</div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 p-8">
        <div className="text-red-500 text-2xl mb-4">❌ {error}</div>
        <div className="text-white/60 text-sm">Vérifiez la console pour plus de détails</div>
      </div>
    );
  }

  // Affichage si aucune page
  if (pages.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Aucune page à afficher</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        ref={horizontalScrollRef}
        className="h-full w-full overflow-x-scroll snap-x snap-mandatory scroll-smooth flex"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {extendedPages.map((page, pageIndex) => (
          <div
            key={`${page.id}-${pageIndex}`}
            className="snap-start snap-always"
            style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          >
            <ScrollPage
              sections={page.sections}
              indicatorPosition="right"
            />
          </div>
        ))}
      </div>

      {/* Indicateur de page horizontal */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {pages.map((page, i) => (
          <div
            key={page.id}
            className={`w-2 h-2 rounded-full transition-all ${(currentPageIndex % pages.length) === i
              ? "bg-white w-8"
              : "bg-white/40"
              }`}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 text-white/80 text-sm z-30 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        ← → pour changer de page | ↑ ↓ pour scroller
      </div>
    </div>
  );
}