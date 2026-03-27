export default function Footer() {
  return (
    <footer className="border-t border-maroon-100 bg-background py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-sans text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mitchell Anderson. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/mitchell-anderson-527au/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
