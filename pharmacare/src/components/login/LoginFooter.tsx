export function LoginFooter() {
  return (
    <footer className="mt-auto w-full border-t border-slate-200/70 pt-4">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
        <p>© 2025 PharmaCare Systems Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a className="font-medium text-teal-brand hover:underline" href="#help">
            Need Help? Contact Support
          </a>
          <span className="text-slate-300">|</span>
          <a className="hover:text-slate-700" href="#privacy">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
