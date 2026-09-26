"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cx } from "@/features/design/design-tokens";
import { playerSelect } from "@/features/exam-engine/mock-test-player-theme";

// The compact drop-down a question is answered from (EXAM-UI-05).
//
// One control for every drop-down question in the player: Listening Parts
// 4, 5 and 6, and all four Reading parts. It replaces the native select
// those screens used to render, for reasons the ticket lists and the QA
// pass saw on screen:
//
// - A native menu cannot be drawn as the radio list an exam question is,
//   so a drop-down question and a radio question looked like two
//   different products.
// - A full width native select stretched the Reading answer column, and
//   the column stretching moved the passage beside it.
// - There was no way to keep the open menu inside the split pane, so a
//   selector near the foot of a Reading column opened into nowhere.
//
// **How it floats.** The menu is position fixed and is placed against the
// trigger's viewport rectangle after it opens, so it is laid out in the
// viewport rather than in the flow: opening one adds no height to the
// page, moves nothing on it, and cannot be clipped by the scrolling pane
// it was opened inside. It flips above the trigger when the space below
// it is smaller and too short, it is clamped to the viewport on both
// axes, and it caps its own height and scrolls rather than running off
// the bottom of the screen. The placement runs again on scroll and on
// resize, so the menu tracks the trigger when the pane behind it moves.
//
// **How it is operated.** It is the ARIA combobox pattern with the focus
// left on the trigger: the button owns the keyboard, the listbox is
// pointed at with aria-activedescendant, and nothing steals focus when
// the menu opens or closes. Arrow keys move the active row, Home and End
// jump, Enter and Space choose, Escape closes and leaves the value alone,
// and Tab closes on the way out. A pointer press inside the menu is
// prevented from taking focus, so the trigger keeps it and a click and a
// keystroke end up in exactly the same state.
//
// **What it does not do.** It holds no answer. The chosen option id is
// owned by the prototype that owns the part, the same as it was with the
// native control, so choosing here and leaving the screen and coming back
// still shows what was chosen. It also knows nothing about which option
// is correct: the answer key is stripped on the server before the content
// reaches the browser, and the value passed around is the content's own
// option id rather than its text.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type MockTestDropdownSelectOption = {
  id: string;
  text: string;
};

export type MockTestDropdownSelectProps = {
  options: MockTestDropdownSelectOption[];
  // The chosen option id, or "" while the question is unanswered.
  value: string;
  onChange: (optionId: string) => void;
  // Shown on the trigger while nothing is chosen.
  placeholderLabel: string;
  // The accessible name of the control. Passed as a string rather than
  // wired to the sentence around it, because the trigger sits inside that
  // sentence and naming it from its own container would fold the
  // trigger's text back into its own name.
  ariaLabel: string;
  className?: string;
};

// Distance between the trigger and the menu, and the smallest gap the
// menu keeps from the edge of the viewport.
const MENU_GAP = 4;
const MENU_VIEWPORT_MARGIN = 8;
// The widest the menu is allowed to get before its options start
// wrapping. A menu wider than this stops being a list and starts being a
// paragraph.
const MENU_MAX_WIDTH = 420;
// Below this there is no useful menu to show in a direction, so the other
// direction wins even if it is also tight.
const MENU_MIN_HEIGHT = 96;

export function MockTestDropdownSelect({
  options,
  value,
  onChange,
  placeholderLabel,
  ariaLabel,
  className,
}: MockTestDropdownSelectProps) {
  const reactId = useId();
  const listId = `${reactId}-listbox`;
  const optionDomId = (index: number) => `${reactId}-option-${index}`;

  const [open, setOpen] = useState(false);
  // Which row the keyboard or the pointer is on. -1 while nothing is.
  const [activeIndex, setActiveIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // A span, not a div. The trigger sits inside the sentence it answers,
  // which is a paragraph, and a div inside a p is invalid markup the
  // browser silently repairs. Both the menu and its rows carry their
  // display in a class and their meaning in a role, so nothing is lost by
  // building them from phrasing elements.
  const menuRef = useRef<HTMLSpanElement | null>(null);

  const selectedIndex = options.findIndex((option) => option.id === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  // Place the open menu against the trigger. DOM writes only, so this is
  // safe to call from an effect and from a scroll listener alike.
  const placeMenu = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;

    if (!trigger || !menu) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    // The menu sizes itself to its options rather than to a fixed width.
    // A fixed position box with no width set is shrink to fit, so with the
    // cap applied and the width cleared, offsetWidth is the width at which
    // the longest option stops wrapping. Reading Part 3 answers with the
    // letters A to E and Reading Part 1 answers with clauses, and neither
    // should be measured against the other. The floor is the min-w class
    // in the recipe.
    const widthCap = Math.min(
      MENU_MAX_WIDTH,
      viewportWidth - MENU_VIEWPORT_MARGIN * 2,
    );
    menu.style.maxWidth = `${widthCap}px`;
    menu.style.width = "";

    // Measured unconstrained first, so the direction is decided against
    // how tall the menu actually wants to be rather than against a cap
    // set on the previous pass.
    menu.style.maxHeight = "";
    const width = Math.min(widthCap, Math.max(rect.width, menu.offsetWidth));
    menu.style.width = `${width}px`;
    const naturalHeight = menu.offsetHeight;

    const spaceBelow = viewportHeight - rect.bottom - MENU_GAP - MENU_VIEWPORT_MARGIN;
    const spaceAbove = rect.top - MENU_GAP - MENU_VIEWPORT_MARGIN;
    const openUp = naturalHeight > spaceBelow && spaceAbove > spaceBelow;

    const available = Math.max(
      MENU_MIN_HEIGHT,
      openUp ? spaceAbove : spaceBelow,
    );
    const height = Math.min(naturalHeight, available);

    const top = openUp ? rect.top - MENU_GAP - height : rect.bottom + MENU_GAP;
    const left = Math.min(
      Math.max(MENU_VIEWPORT_MARGIN, rect.left),
      Math.max(MENU_VIEWPORT_MARGIN, viewportWidth - MENU_VIEWPORT_MARGIN - width),
    );

    menu.style.maxHeight = `${available}px`;
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = "visible";
  }, []);

  // Placement, and keeping it placed. The scroll listener is registered
  // in the capture phase because the thing that moves the trigger is
  // usually a scrolling pane rather than the window.
  useEffect(() => {
    if (!open) {
      return;
    }

    placeMenu();

    const handleViewportChange = () => placeMenu();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, placeMenu]);

  // Keep the active row in view when the arrow keys walk past the cap.
  useEffect(() => {
    if (!open) {
      return;
    }

    const activeRow = menuRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    activeRow?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  // A press anywhere else closes the menu. Pointerdown rather than click,
  // so the menu is gone before whatever was pressed reacts.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (
        target &&
        (triggerRef.current?.contains(target) || menuRef.current?.contains(target))
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [open]);

  const openMenu = () => {
    setOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const closeMenu = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const chooseIndex = (index: number) => {
    const option = options[index];

    if (!option) {
      return;
    }

    onChange(option.id);
    closeMenu();
    triggerRef.current?.focus();
  };

  const moveActive = (delta: number) => {
    if (options.length === 0) {
      return;
    }

    setActiveIndex((current) => {
      const from = current >= 0 ? current : selectedIndex >= 0 ? selectedIndex : 0;
      const next = from + delta;

      if (next < 0) {
        return 0;
      }

      if (next > options.length - 1) {
        return options.length - 1;
      }

      return next;
    });
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab") {
      if (open) {
        closeMenu();
      }

      return;
    }

    if (!open) {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        openMenu();
      }

      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        chooseIndex(activeIndex >= 0 ? activeIndex : 0);
        break;
      default:
        break;
    }
  };

  return (
    <span className={cx(playerSelect.wrap, className)}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionDomId(activeIndex) : undefined
        }
        // The full option text, for a value the trigger had to truncate.
        title={selectedOption?.text}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={cx(
          playerSelect.trigger,
          selectedOption ? playerSelect.triggerSelected : "",
          open ? playerSelect.triggerOpen : "",
        )}
      >
        <span
          className={cx(
            playerSelect.triggerText,
            selectedOption ? "" : playerSelect.triggerTextEmpty,
          )}
        >
          {selectedOption?.text ?? placeholderLabel}
        </span>

        <span className={playerSelect.caret} aria-hidden="true" />
      </button>

      {open ? (
        <span
          ref={menuRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={playerSelect.menu}
        >
          {options.map((option, index) => {
            const selected = option.id === value;
            const active = index === activeIndex;

            return (
              <span
                key={option.id}
                id={optionDomId(index)}
                role="option"
                aria-selected={selected}
                data-active={active ? "true" : undefined}
                // Keeps focus on the trigger, so a click and a keystroke
                // leave the control in the same state.
                onPointerDown={(event) => event.preventDefault()}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => chooseIndex(index)}
                className={cx(
                  playerSelect.option,
                  selected ? playerSelect.optionSelected : "",
                  active && !selected ? playerSelect.optionActive : "",
                )}
              >
                <span
                  className={cx(
                    playerSelect.radio,
                    selected ? playerSelect.radioSelected : "",
                  )}
                  aria-hidden="true"
                >
                  {selected ? <span className={playerSelect.radioDot} /> : null}
                </span>

                <span className={playerSelect.optionText}>{option.text}</span>
              </span>
            );
          })}
        </span>
      ) : null}
    </span>
  );
}
