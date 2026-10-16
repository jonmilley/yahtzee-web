export default function Credits() {
  return (
    <footer className="px-4 pb-6 pt-8 text-center text-[0.8rem] leading-relaxed text-paper/55">
      <p>Welcome to Yahtzee, brought to you by Jonathan Milley and Lori Hogan</p>
      <p>Converted from Java to React by Jonathan Milley and Claude Sonnet 4.6</p>
      <a
        href="/yahtzee.jar"
        download="yahtzee.jar"
        className="mt-1 inline-block underline decoration-paper/30 underline-offset-2 transition-colors hover:text-marigold hover:decoration-marigold"
      >
        Download the original Java version (v1.0)
      </a>
    </footer>
  )
}
