"use client";

import { useEffect, useState, type MouseEvent } from "react";

const WIDGET_SCRIPT = "https://www.eventbrite.co.uk/static/widgets/eb_widgets.js";

declare global {
  interface Window {
    EBWidgets?: {
      createWidget(options: {
        widgetType: "checkout";
        eventId: string;
        modal: boolean;
        modalTriggerElementId: string;
      }): void;
    };
  }
}

/*
  Eventbrite's widget script, fetched once for the whole page however many
  buttons there are. Each button waits on the same promise and builds its
  own widget when it resolves.

  This used to be next/script with an onReady on each button. With two
  buttons that only built the first: the script is deduplicated by its
  address, and the ready callback ran for the instance that loaded it and
  not for the one that found it already loading. The second button then
  stayed a plain link to Eventbrite, which is the fallback working, but
  not the checkout over the page it was meant to be.
*/
let widgets: Promise<void> | null = null;
function loadWidgets(): Promise<void> {
  if (widgets) return widgets;
  widgets = new Promise((resolve) => {
    if (window.EBWidgets) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    // A blocked or failed script leaves the promise pending for ever, and
    // the button a link to Eventbrite, which is exactly right.
    if (!existing) {
      script.src = WIDGET_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
  });
  return widgets;
}

/*
  Book tickets: Eventbrite's checkout, opened over the page.

  Eventbrite's own snippet is a <button> beside a <noscript> copy of the
  link. This is a link and nothing else, which is better in every case
  that matters. Without JavaScript it goes to Eventbrite. With JavaScript
  but no widget (blocked, or simply not there yet, since the script is
  fetched after the page is interactive), it still goes to Eventbrite. It
  is only once the widget has actually been built that the click is
  stopped from following the link, and by then there is a modal to open
  instead. A <button> would have been a dead control in all of those
  cases, and a dead control that says Book tickets is the worst of them.

  Eventbrite finds the link by its id and binds its own listener to it.
  The one below runs afterwards, at the root, where React puts it: calling
  preventDefault there cancels the navigation without stopping Eventbrite's
  listener, which has already opened the modal. A click with a modifier
  key is left alone, so opening it in a new tab still works.
*/
export default function TicketsButton({
  eventId,
  url,
  label,
  className,
}: {
  eventId: string;
  url: string;
  label: string;
  className?: string;
}) {
  const [modal, setModal] = useState(false);
  const triggerId = `eventbrite-checkout-${eventId}`;

  useEffect(() => {
    let mounted = true;
    loadWidgets().then(() => {
      if (!mounted || !window.EBWidgets) return;
      window.EBWidgets.createWidget({
        widgetType: "checkout",
        eventId,
        modal: true,
        modalTriggerElementId: triggerId,
      });
      setModal(true);
    });
    return () => {
      mounted = false;
    };
  }, [eventId, triggerId]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (modal && !modified && event.button === 0) event.preventDefault();
  };

  return (
    <a
      id={triggerId}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {label}
    </a>
  );
}
