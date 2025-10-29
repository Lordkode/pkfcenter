"use client";
import { useEffect, useRef, useState } from "react";

// Page Component
function ScrollPage({ sections, indicatorPosition = "right" }: {
  sections: Array<{ text: string; color: string }>;
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
    <div className="relative h-screen w-screen overflow-hidden flex-shrink-0">
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
            className="h-screen w-full flex flex-col items-center justify-center text-5xl font-extrabold snap-start snap-always transition-all duration-300"
            style={{ backgroundColor: section.color }}
          >
            <div className="text-white drop-shadow-lg">
              {section.text}
            </div>
            <div className="text-white/60 text-lg mt-4">
              Swipe pour continuer
            </div>
          </section>
        ))}
      </div>

      {/* Indicateur de position */}
      <div
        className={`fixed ${indicatorPosition === "right" ? "right-8" : "left-8"} top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10`}
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

  const pages = [
    {
      sections: [
        { text: "Collection Automne", color: "#DBA159" },
        { text: "Nouveautés Bébé", color: "#357429" },
        { text: "Offres Spéciales", color: "#A4A61B" },
      ],
    },
    {
      sections: [
        { text: "Mode Printemps", color: "#E67E22" },
        { text: "Accessoires Tendance", color: "#3498DB" },
        { text: "Collection Premium", color: "#9B59B6" },
      ],
    },
    {
      sections: [
        { text: "Style Été", color: "#E74C3C" },
        { text: "Beachwear 2024", color: "#1ABC9C" },
        { text: "Urban Collection", color: "#34495E" },
      ],
    },
  ];

  // Triple les pages pour l'effet infini horizontal
  const extendedPages = [...pages, ...pages, ...pages];

  useEffect(() => {
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

        // Force le snap exact sur la page
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

    // Initialise au milieu
    container.scrollLeft = pages.length * pageWidth;

    container.addEventListener("scroll", handleHorizontalScroll);
    return () => {
      container.removeEventListener("scroll", handleHorizontalScroll);
      clearTimeout(scrollTimeout);
    };
  }, [pages.length, extendedPages.length]);

  // Support clavier pour navigation horizontale
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
          <div key={pageIndex} className="snap-start snap-always" style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
            <ScrollPage
              sections={page.sections}
              indicatorPosition="right"
            />
          </div>
        ))}
      </div>

      {/* Indicateur de page horizontal */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {pages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${(currentPageIndex % pages.length) === i
                ? "bg-white w-8"
                : "bg-white/40"
              }`}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 text-white/80 text-sm z-20 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        ← → pour changer de page | ↑ ↓ pour scroller
      </div>
    </div>
  );
}