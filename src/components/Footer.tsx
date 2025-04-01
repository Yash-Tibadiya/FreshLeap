export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-6 md:py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h3 className="font-bold text-lg">FreshLeap</h3>
          <p className="text-gray-400 text-sm">
            Connecting farmers and consumers directly.
          </p>
        </div>

        <div className="text-center md:text-right text-sm text-gray-400">
          <p>© 2025 FreshLeap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
