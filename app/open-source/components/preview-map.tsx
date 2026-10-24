"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
const loading = () => (
  <div className="kit-preview-loading" role="status">
    <span />
    Getting the details ready…
  </div>
);
export const componentPreviews: Record<string, ComponentType> = {
  accordion: dynamic(
    () =>
      import("../../../components/examples/accordion").then((m) => m.default),
    { ssr: false, loading },
  ),
  alert: dynamic(
    () => import("../../../components/examples/alert").then((m) => m.default),
    { ssr: false, loading },
  ),
  "alert-dialog": dynamic(
    () =>
      import("../../../components/examples/alert-dialog").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  "aspect-ratio": dynamic(
    () =>
      import("../../../components/examples/aspect-ratio").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  attachment: dynamic(
    () =>
      import("../../../components/examples/attachment").then((m) => m.default),
    { ssr: false, loading },
  ),
  avatar: dynamic(
    () => import("../../../components/examples/avatar").then((m) => m.default),
    { ssr: false, loading },
  ),
  badge: dynamic(
    () => import("../../../components/examples/badge").then((m) => m.default),
    { ssr: false, loading },
  ),
  breadcrumb: dynamic(
    () =>
      import("../../../components/examples/breadcrumb").then((m) => m.default),
    { ssr: false, loading },
  ),
  bubble: dynamic(
    () => import("../../../components/examples/bubble").then((m) => m.default),
    { ssr: false, loading },
  ),
  button: dynamic(
    () => import("../../../components/examples/button").then((m) => m.default),
    { ssr: false, loading },
  ),
  "button-group": dynamic(
    () =>
      import("../../../components/examples/button-group").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  calendar: dynamic(
    () =>
      import("../../../components/examples/calendar").then((m) => m.default),
    { ssr: false, loading },
  ),
  card: dynamic(
    () => import("../../../components/examples/card").then((m) => m.default),
    { ssr: false, loading },
  ),
  carousel: dynamic(
    () =>
      import("../../../components/examples/carousel").then((m) => m.default),
    { ssr: false, loading },
  ),
  chart: dynamic(
    () => import("../../../components/examples/chart").then((m) => m.default),
    { ssr: false, loading },
  ),
  checkbox: dynamic(
    () =>
      import("../../../components/examples/checkbox").then((m) => m.default),
    { ssr: false, loading },
  ),
  "code-block": dynamic(
    () =>
      import("../../../components/examples/code-block").then((m) => m.default),
    { ssr: false, loading },
  ),
  collapsible: dynamic(
    () =>
      import("../../../components/examples/collapsible").then((m) => m.default),
    { ssr: false, loading },
  ),
  combobox: dynamic(
    () =>
      import("../../../components/examples/combobox").then((m) => m.default),
    { ssr: false, loading },
  ),
  command: dynamic(
    () => import("../../../components/examples/command").then((m) => m.default),
    { ssr: false, loading },
  ),
  "context-menu": dynamic(
    () =>
      import("../../../components/examples/context-menu").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  dialog: dynamic(
    () => import("../../../components/examples/dialog").then((m) => m.default),
    { ssr: false, loading },
  ),
  direction: dynamic(
    () =>
      import("../../../components/examples/direction").then((m) => m.default),
    { ssr: false, loading },
  ),
  drawer: dynamic(
    () => import("../../../components/examples/drawer").then((m) => m.default),
    { ssr: false, loading },
  ),
  "dropdown-menu": dynamic(
    () =>
      import("../../../components/examples/dropdown-menu").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  empty: dynamic(
    () => import("../../../components/examples/empty").then((m) => m.default),
    { ssr: false, loading },
  ),
  field: dynamic(
    () => import("../../../components/examples/field").then((m) => m.default),
    { ssr: false, loading },
  ),
  form: dynamic(
    () => import("../../../components/examples/form").then((m) => m.default),
    { ssr: false, loading },
  ),
  "hover-card": dynamic(
    () =>
      import("../../../components/examples/hover-card").then((m) => m.default),
    { ssr: false, loading },
  ),
  input: dynamic(
    () => import("../../../components/examples/input").then((m) => m.default),
    { ssr: false, loading },
  ),
  "input-group": dynamic(
    () =>
      import("../../../components/examples/input-group").then((m) => m.default),
    { ssr: false, loading },
  ),
  "input-otp": dynamic(
    () =>
      import("../../../components/examples/input-otp").then((m) => m.default),
    { ssr: false, loading },
  ),
  item: dynamic(
    () => import("../../../components/examples/item").then((m) => m.default),
    { ssr: false, loading },
  ),
  kbd: dynamic(
    () => import("../../../components/examples/kbd").then((m) => m.default),
    { ssr: false, loading },
  ),
  label: dynamic(
    () => import("../../../components/examples/label").then((m) => m.default),
    { ssr: false, loading },
  ),
  marker: dynamic(
    () => import("../../../components/examples/marker").then((m) => m.default),
    { ssr: false, loading },
  ),
  menubar: dynamic(
    () => import("../../../components/examples/menubar").then((m) => m.default),
    { ssr: false, loading },
  ),
  message: dynamic(
    () => import("../../../components/examples/message").then((m) => m.default),
    { ssr: false, loading },
  ),
  "message-scroller": dynamic(
    () =>
      import("../../../components/examples/message-scroller").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  "native-select": dynamic(
    () =>
      import("../../../components/examples/native-select").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  "navigation-menu": dynamic(
    () =>
      import("../../../components/examples/navigation-menu").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  pagination: dynamic(
    () =>
      import("../../../components/examples/pagination").then((m) => m.default),
    { ssr: false, loading },
  ),
  popover: dynamic(
    () => import("../../../components/examples/popover").then((m) => m.default),
    { ssr: false, loading },
  ),
  progress: dynamic(
    () =>
      import("../../../components/examples/progress").then((m) => m.default),
    { ssr: false, loading },
  ),
  questionnaire: dynamic(
    () =>
      import("../../../components/examples/questionnaire").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  "radio-group": dynamic(
    () =>
      import("../../../components/examples/radio-group").then((m) => m.default),
    { ssr: false, loading },
  ),
  resizable: dynamic(
    () =>
      import("../../../components/examples/resizable").then((m) => m.default),
    { ssr: false, loading },
  ),
  "scroll-area": dynamic(
    () =>
      import("../../../components/examples/scroll-area").then((m) => m.default),
    { ssr: false, loading },
  ),
  select: dynamic(
    () => import("../../../components/examples/select").then((m) => m.default),
    { ssr: false, loading },
  ),
  separator: dynamic(
    () =>
      import("../../../components/examples/separator").then((m) => m.default),
    { ssr: false, loading },
  ),
  sheet: dynamic(
    () => import("../../../components/examples/sheet").then((m) => m.default),
    { ssr: false, loading },
  ),
  sidebar: dynamic(
    () => import("../../../components/examples/sidebar").then((m) => m.default),
    { ssr: false, loading },
  ),
  skeleton: dynamic(
    () =>
      import("../../../components/examples/skeleton").then((m) => m.default),
    { ssr: false, loading },
  ),
  slider: dynamic(
    () => import("../../../components/examples/slider").then((m) => m.default),
    { ssr: false, loading },
  ),
  sonner: dynamic(
    () => import("../../../components/examples/sonner").then((m) => m.default),
    { ssr: false, loading },
  ),
  spinner: dynamic(
    () => import("../../../components/examples/spinner").then((m) => m.default),
    { ssr: false, loading },
  ),
  switch: dynamic(
    () => import("../../../components/examples/switch").then((m) => m.default),
    { ssr: false, loading },
  ),
  table: dynamic(
    () => import("../../../components/examples/table").then((m) => m.default),
    { ssr: false, loading },
  ),
  tabs: dynamic(
    () => import("../../../components/examples/tabs").then((m) => m.default),
    { ssr: false, loading },
  ),
  textarea: dynamic(
    () =>
      import("../../../components/examples/textarea").then((m) => m.default),
    { ssr: false, loading },
  ),
  toast: dynamic(
    () => import("../../../components/examples/toast").then((m) => m.default),
    { ssr: false, loading },
  ),
  toggle: dynamic(
    () => import("../../../components/examples/toggle").then((m) => m.default),
    { ssr: false, loading },
  ),
  "toggle-group": dynamic(
    () =>
      import("../../../components/examples/toggle-group").then(
        (m) => m.default,
      ),
    { ssr: false, loading },
  ),
  tooltip: dynamic(
    () => import("../../../components/examples/tooltip").then((m) => m.default),
    { ssr: false, loading },
  ),
  trace: dynamic(
    () => import("../../../components/examples/trace").then((m) => m.default),
    { ssr: false, loading },
  ),
  "date-picker": dynamic(
    () => import("../../../components/patterns/date-picker"),
    { ssr: false, loading },
  ),
  "data-table": dynamic(
    () => import("../../../components/patterns/data-table"),
    { ssr: false, loading },
  ),
  typography: dynamic(() => import("../../../components/patterns/typography"), {
    ssr: false,
    loading,
  }),
};
