export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-4 left-4 z-(--z-preloader) -translate-y-24 rounded-full bg-bone px-5 py-3 label text-void transition-transform focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
