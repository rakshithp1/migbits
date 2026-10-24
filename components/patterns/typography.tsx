// Typography recipe using shadcn/ui's MIT Tailwind conventions.
export default function TypographyExample() {
  return (
    <article className="max-w-lg space-y-5">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        A NOTE ON MAKING THINGS
      </p>
      <h2 className="text-4xl font-semibold tracking-tight text-balance">
        A good idea deserves
        <br />a little breathing room.
      </h2>
      <p className="leading-7 text-muted-foreground">
        The right type, the right rhythm. A small set of considered choices can
        make an interface feel entirely your own.
      </p>
      <blockquote className="border-l-2 border-primary pl-5 text-lg italic">
        “Make the details count.”
      </blockquote>
      <p className="text-sm text-muted-foreground">
        Thoughtful by default. Yours by design.
      </p>
    </article>
  );
}
