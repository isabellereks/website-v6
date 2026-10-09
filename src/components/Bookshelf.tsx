"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import Image from "next/image";
import { books, type Book } from "@/data/books";
import "./bookshelf.css";

interface BookStyle extends CSSProperties {
  "--book-color": string;
  "--book-ink": string;
  "--book-height": string;
  "--book-width": string;
  "--cover-ratio": number;
}

const EASE = "cubic-bezier(.2,.75,.22,1)";

// Fit title and author along the spine. Long titles shrink like a real spine;
// if the author won't fit too, leave it off (plenty of narrow spines do).
function spineLayout(book: Book) {
  const author = book.author.split(" ").at(-1) ?? "";
  const titleSize = (room: number) => Math.min(13, room / (book.title.length * 0.56));
  const withAuthor = titleSize(book.height - 28 - author.length * 10.5 - 14);
  return withAuthor >= 9.5
    ? { titleSize: withAuthor, author }
    : { titleSize: Math.min(13, titleSize(book.height - 40)), author: null };
}

// Stripe Press style shelf, ported from the current isabellereks.com: hovering a spine
// pulls the book out and turns it to show the cover; clicking opens it.
export default function Bookshelf() {
  const [previewedId, setPreviewedId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [raisedIds, setRaisedIds] = useState<Set<string>>(() => new Set());
  const animationsRef = useRef<Animation[]>([]);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const previewBook = (id: string | null) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    if (id) {
      setRaisedIds((current) => (current.has(id) ? current : new Set(current).add(id)));
      setPreviewedId(id);
    } else {
      leaveTimerRef.current = setTimeout(() => setPreviewedId(null), 100);
    }
  };

  const activeId = openingId ?? previewedId;
  const activeBook = books.find((book) => book.id === activeId);

  useEffect(() => {
    // Coming back with the browser's back button should show a closed shelf.
    const reset = () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      animationsRef.current.forEach((animation) => animation.cancel());
      animationsRef.current = [];
      setOpeningId(null);
      setPreviewedId(null);
      setRaisedIds(new Set());
    };
    window.addEventListener("pageshow", reset);
    return () => {
      window.removeEventListener("pageshow", reset);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      animationsRef.current.forEach((animation) => animation.cancel());
    };
  }, []);

  const openBook = async (event: MouseEvent<HTMLAnchorElement>, book: Book) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    if (animationsRef.current.length) return;

    const slot = event.currentTarget;
    const model = slot.querySelector<HTMLElement>(".book-model");
    const shape = slot.querySelector<HTMLElement>(".book-shape");
    const jacket = slot.querySelector<HTMLElement>(".book-jacket");
    if (!model || !shape || !jacket) {
      window.location.assign(book.href);
      return;
    }

    const shift = getComputedStyle(slot).getPropertyValue("--open-shift");
    setOpeningId(book.id);
    setRaisedIds((current) => new Set(current).add(book.id));

    const move = model.animate(
      [{ transform: getComputedStyle(model).transform }, { transform: `translate3d(${shift}, -22px, 90px)` }],
      { duration: 420, easing: EASE, fill: "forwards" },
    );
    const turn = shape.animate(
      [{ transform: getComputedStyle(shape).transform }, { transform: "rotateY(-90deg)" }],
      { duration: 420, easing: EASE, fill: "forwards" },
    );
    const animations = [move, turn];
    animationsRef.current = animations;

    try {
      await Promise.all([move.finished, turn.finished]);
      if (animationsRef.current !== animations) return;
      const open = jacket.animate(
        [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-125deg)", offset: 0.8 }, { transform: "rotateY(-125deg)" }],
        { duration: 650, easing: "cubic-bezier(.3,0,.2,1)", fill: "forwards" },
      );
      animationsRef.current.push(open);
      await open.finished;
      if (animationsRef.current !== animations) return;
      window.location.assign(book.href);
    } catch {
      if (animationsRef.current === animations) {
        animationsRef.current = [];
        setOpeningId(null);
      }
    }
  };

  return (
    <section className="bookshelf-section" aria-label="Bookshelf">
      <div className="shelf-scene" data-previewing={activeId !== null}>
        <div className="shelf-books">
          {books.map((book) => {
            const style: BookStyle = {
              "--book-color": book.color,
              "--book-ink": book.ink,
              "--book-height": `${book.height}px`,
              "--book-width": `${book.width}px`,
              "--cover-ratio": book.coverRatio ?? 140 / 172,
            };
            const spine = spineLayout(book);
            return (
              <a
                key={book.id}
                className="book-slot"
                href={book.href}
                style={style}
                aria-label={`Open ${book.title} by ${book.author}`}
                aria-busy={openingId === book.id}
                data-active={activeId === book.id}
                data-raised={raisedIds.has(book.id)}
                onTransitionEnd={(event) => {
                  if (
                    event.propertyName !== "transform" ||
                    event.target !== event.currentTarget.querySelector(".book-model") ||
                    activeId === book.id
                  )
                    return;
                  setRaisedIds((current) => {
                    const next = new Set(current);
                    next.delete(book.id);
                    return next;
                  });
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") previewBook(book.id);
                }}
                onPointerLeave={() => previewBook(null)}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) previewBook(book.id);
                }}
                onBlur={() => previewBook(null)}
                onKeyDown={(event) => {
                  if (event.key !== "Escape") return;
                  if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
                  animationsRef.current.forEach((animation) => animation.cancel());
                  animationsRef.current = [];
                  setOpeningId(null);
                  setPreviewedId(null);
                }}
                onClick={(event) => openBook(event, book)}
              >
                <span className="book-model" aria-hidden="true">
                  <span className="book-shape">
                    <span className="book-spine" data-photo={!!book.spine}>
                      {book.spine ? (
                        <Image src={book.spine} alt="" fill sizes="48px" className="spine-photo" draggable={false} />
                      ) : (
                        <>
                          <span className="spine-title" style={{ fontSize: spine.titleSize }}>
                            {book.title}
                          </span>
                          {spine.author && <span className="spine-author">{spine.author}</span>}
                        </>
                      )}
                    </span>
                    <span className="book-pages" />
                    <span className="book-cover" data-project={!book.cover}>
                      <span className="book-inside">
                        <strong>{book.title}</strong>
                        <span>{book.description ?? book.author}</span>
                      </span>
                      <span className="book-jacket">
                        <span className="jacket-back" />
                        {book.cover ? (
                          <Image src={book.cover} alt="" width={140} height={book.height} draggable={false} />
                        ) : (
                          <span className="cover-fallback">
                            <strong>{book.title}</strong>
                            <span>{book.description ?? book.author}</span>
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                </span>
              </a>
            );
          })}
        </div>
        <div className="shelf-board" aria-hidden="true" />
      </div>
      <div className="book-caption" aria-live="polite" aria-atomic="true">
        {activeBook && (
          <>
            <span className="caption-title">
              {activeBook.title}
              <span aria-hidden="true"> ↗</span>
            </span>
            <span>{activeBook.description ?? `${activeBook.author} · ${activeBook.category}`}</span>
          </>
        )}
      </div>
    </section>
  );
}
