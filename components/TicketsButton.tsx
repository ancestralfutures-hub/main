"use client";

import Script from "next/script";
import { useState, type MouseEvent } from "react";

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
  Book tickets: Eventbrite's checkout, opened over the page.

  Eventbrite's own snippet is a <button> beside a <noscript> copy of the
  link. This is a link and nothing else, which is better in every case
  that matters. Without JavaScript it goes to Eventbrite. With JavaScript
  but no widget — blocked, or simply not there yet, since the script is
  fetched after the page is interactive — it still goes to Eventbrite. It
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

  const build = () => {
    if (!window.EBWidgets) return;
    window.EBWidgets.createWidget({
      widgetType: "checkout",
      eventId,
      modal: true,
      modalTriggerElementId: triggerId,
    });
    setModal(true);
  };

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (modal && !modified && event.button === 0) event.preventDefault();
  };

  return (
    <>
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
      {/* After the page is interactive: the button works before it lands.
          onReady rather than onLoad, so the widget is still built if the
          script is already in the browser's cache from a previous view. */}
      <Script src={WIDGET_SCRIPT} strategy="afterInteractive" onReady={build} />
    </>
  );
}
